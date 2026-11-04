-- ============================================================================
-- FEEDO RESTAURANT PARTNER — SECURITY FUNCTIONS & ROW LEVEL SECURITY (02)
-- Zero-Trust Multi-Tenant RLS & RBAC Engine
-- ============================================================================

-- ============================================================================
-- 1. SECURITY HELPER FUNCTIONS (SECURITY DEFINER with strict search_path)
-- ============================================================================

-- Check if current authenticated user is an active member of the restaurant
CREATE OR REPLACE FUNCTION public.is_restaurant_member(lookup_restaurant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.restaurant_users
        WHERE restaurant_id = lookup_restaurant_id
          AND user_id = auth.uid()
          AND status = 'active'
    );
$$;

-- Check if current authenticated user has specific role(s) in the restaurant
CREATE OR REPLACE FUNCTION public.has_restaurant_role(
    lookup_restaurant_id UUID,
    allowed_roles public.restaurant_user_role[]
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.restaurant_users
        WHERE restaurant_id = lookup_restaurant_id
          AND user_id = auth.uid()
          AND role = ANY(allowed_roles)
          AND status = 'active'
    );
$$;

-- Check if current authenticated user is the OWNER of the restaurant
CREATE OR REPLACE FUNCTION public.is_restaurant_owner(lookup_restaurant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.restaurant_users
        WHERE restaurant_id = lookup_restaurant_id
          AND user_id = auth.uid()
          AND role = 'OWNER'
          AND status = 'active'
    );
$$;

-- Get list of restaurant IDs the current user belongs to
CREATE OR REPLACE FUNCTION public.get_user_restaurant_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
    SELECT restaurant_id
    FROM public.restaurant_users
    WHERE user_id = auth.uid()
      AND status = 'active';
$$;

-- Tamper-resistant server-side audit logger helper
CREATE OR REPLACE FUNCTION public.record_audit_log(
    p_restaurant_id UUID,
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id TEXT,
    p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (
        user_id,
        restaurant_id,
        action,
        resource_type,
        resource_id,
        metadata
    ) VALUES (
        auth.uid(),
        p_restaurant_id,
        p_action,
        p_resource_type,
        p_resource_id,
        p_metadata
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;

-- Server-Side Order State Machine Validation Trigger
CREATE OR REPLACE FUNCTION public.validate_order_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only validate when status actually changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Check legal state transitions
        IF OLD.status = 'PLACED' AND NEW.status NOT IN ('ACCEPTED', 'REJECTED', 'CANCELLED') THEN
            RAISE EXCEPTION 'Illegal order status transition from % to %', OLD.status, NEW.status;
        ELSIF OLD.status = 'ACCEPTED' AND NEW.status NOT IN ('PREPARING', 'CANCELLED', 'REJECTED') THEN
            RAISE EXCEPTION 'Illegal order status transition from % to %', OLD.status, NEW.status;
        ELSIF OLD.status = 'PREPARING' AND NEW.status NOT IN ('READY', 'CANCELLED') THEN
            RAISE EXCEPTION 'Illegal order status transition from % to %', OLD.status, NEW.status;
        ELSIF OLD.status = 'READY' AND NEW.status NOT IN ('PICKED_UP', 'CANCELLED') THEN
            RAISE EXCEPTION 'Illegal order status transition from % to %', OLD.status, NEW.status;
        ELSIF OLD.status = 'PICKED_UP' AND NEW.status NOT IN ('DELIVERED', 'CANCELLED') THEN
            RAISE EXCEPTION 'Illegal order status transition from % to %', OLD.status, NEW.status;
        ELSIF OLD.status IN ('DELIVERED', 'CANCELLED', 'REJECTED') THEN
            RAISE EXCEPTION 'Order is in terminal state (%) and cannot be transitioned to %', OLD.status, NEW.status;
        END IF;

        -- Record automated audit log on status transition
        PERFORM public.record_audit_log(
            NEW.restaurant_id,
            'ORDER_STATUS_CHANGED',
            'orders',
            NEW.id,
            jsonb_build_object(
                'previous_status', OLD.status,
                'new_status', NEW.status,
                'order_number', NEW.order_number
            )
        );
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_validate_order_status
    BEFORE UPDATE OF status ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.validate_order_status_transition();

-- Authoritative Payment Guard: Disallow regular authenticated users from altering payment_status
CREATE OR REPLACE FUNCTION public.guard_order_payment_status_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN
        -- Only Service Role or Database Functions can mutate payment status
        IF auth.role() = 'authenticated' THEN
            RAISE EXCEPTION 'Forbidden: Restaurant users cannot manually modify payment_status. Payment status is authoritatively managed by the payment gateway webhook.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_guard_order_payment_status
    BEFORE UPDATE OF payment_status ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.guard_order_payment_status_updates();

-- ============================================================================
-- 2. ROW LEVEL SECURITY (RLS) ACTIVATION
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_kyc ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. RLS POLICIES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PROFILES POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (id = auth.uid());

-- ----------------------------------------------------------------------------
-- RESTAURANTS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view their restaurants" ON public.restaurants;
CREATE POLICY "Members can view their restaurants"
    ON public.restaurants FOR SELECT
    USING (
        id IN (SELECT public.get_user_restaurant_ids())
        OR owner_id = auth.uid()
    );

DROP POLICY IF EXISTS "Owners and Managers can update restaurant details" ON public.restaurants;
CREATE POLICY "Owners and Managers can update restaurant details"
    ON public.restaurants FOR UPDATE
    USING (
        public.has_restaurant_role(id, ARRAY['OWNER', 'MANAGER']::public.restaurant_user_role[])
    )
    WITH CHECK (
        public.has_restaurant_role(id, ARRAY['OWNER', 'MANAGER']::public.restaurant_user_role[])
    );

DROP POLICY IF EXISTS "Authenticated users can create restaurant" ON public.restaurants;
CREATE POLICY "Authenticated users can create restaurant"
    ON public.restaurants FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- ----------------------------------------------------------------------------
-- RESTAURANT_USERS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view staff in their restaurant" ON public.restaurant_users;
CREATE POLICY "Members can view staff in their restaurant"
    ON public.restaurant_users FOR SELECT
    USING (public.is_restaurant_member(restaurant_id));

DROP POLICY IF EXISTS "Only Owners can manage staff" ON public.restaurant_users;
CREATE POLICY "Only Owners can manage staff"
    ON public.restaurant_users FOR ALL
    USING (public.is_restaurant_owner(restaurant_id))
    WITH CHECK (public.is_restaurant_owner(restaurant_id));

-- ----------------------------------------------------------------------------
-- RESTAURANT_KYC POLICIES (Strictly restricted to OWNER)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Only Owners can view KYC data" ON public.restaurant_kyc;
CREATE POLICY "Only Owners can view KYC data"
    ON public.restaurant_kyc FOR SELECT
    USING (public.is_restaurant_owner(restaurant_id));

DROP POLICY IF EXISTS "Only Owners can submit or update KYC" ON public.restaurant_kyc;
CREATE POLICY "Only Owners can submit or update KYC"
    ON public.restaurant_kyc FOR ALL
    USING (public.is_restaurant_owner(restaurant_id))
    WITH CHECK (public.is_restaurant_owner(restaurant_id));

-- ----------------------------------------------------------------------------
-- RESTAURANT_BANK_ACCOUNTS POLICIES (Strictly restricted to OWNER)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Only Owners can view bank account data" ON public.restaurant_bank_accounts;
CREATE POLICY "Only Owners can view bank account data"
    ON public.restaurant_bank_accounts FOR SELECT
    USING (public.is_restaurant_owner(restaurant_id));

DROP POLICY IF EXISTS "Only Owners can insert or update bank accounts" ON public.restaurant_bank_accounts;
CREATE POLICY "Only Owners can insert or update bank accounts"
    ON public.restaurant_bank_accounts FOR ALL
    USING (public.is_restaurant_owner(restaurant_id))
    WITH CHECK (public.is_restaurant_owner(restaurant_id));

-- ----------------------------------------------------------------------------
-- MENU_CATEGORIES & MENU_ITEMS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view menu categories" ON public.menu_categories;
CREATE POLICY "Members can view menu categories"
    ON public.menu_categories FOR SELECT
    USING (public.is_restaurant_member(restaurant_id));

DROP POLICY IF EXISTS "Owners and Managers can manage menu categories" ON public.menu_categories;
CREATE POLICY "Owners and Managers can manage menu categories"
    ON public.menu_categories FOR ALL
    USING (public.has_restaurant_role(restaurant_id, ARRAY['OWNER', 'MANAGER']::public.restaurant_user_role[]))
    WITH CHECK (public.has_restaurant_role(restaurant_id, ARRAY['OWNER', 'MANAGER']::public.restaurant_user_role[]));

DROP POLICY IF EXISTS "Members can view menu items" ON public.menu_items;
CREATE POLICY "Members can view menu items"
    ON public.menu_items FOR SELECT
    USING (public.is_restaurant_member(restaurant_id));

DROP POLICY IF EXISTS "Owners and Managers can manage menu items" ON public.menu_items;
CREATE POLICY "Owners and Managers can manage menu items"
    ON public.menu_items FOR ALL
    USING (public.has_restaurant_role(restaurant_id, ARRAY['OWNER', 'MANAGER', 'KITCHEN']::public.restaurant_user_role[]))
    WITH CHECK (public.has_restaurant_role(restaurant_id, ARRAY['OWNER', 'MANAGER', 'KITCHEN']::public.restaurant_user_role[]));

-- ----------------------------------------------------------------------------
-- ORDERS & ORDER_ITEMS POLICIES
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view their restaurant orders" ON public.orders;
CREATE POLICY "Members can view their restaurant orders"
    ON public.orders FOR SELECT
    USING (public.is_restaurant_member(restaurant_id));

DROP POLICY IF EXISTS "Members can update order states" ON public.orders;
CREATE POLICY "Members can update order states"
    ON public.orders FOR UPDATE
    USING (public.is_restaurant_member(restaurant_id))
    WITH CHECK (public.is_restaurant_member(restaurant_id));

DROP POLICY IF EXISTS "Members can view order items" ON public.order_items;
CREATE POLICY "Members can view order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
              AND public.is_restaurant_member(orders.restaurant_id)
        )
    );

-- ----------------------------------------------------------------------------
-- PAYOUTS POLICIES (Only OWNER can view, modifications strictly blocked from client)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Only Owners can view payouts" ON public.payouts;
CREATE POLICY "Only Owners can view payouts"
    ON public.payouts FOR SELECT
    USING (public.is_restaurant_owner(restaurant_id));

-- Note: INSERT / UPDATE / DELETE on payouts is disallowed for regular client queries (Edge Functions / Service Role only)

-- ----------------------------------------------------------------------------
-- AUDIT_LOGS POLICIES (Owners and Managers can view audit logs)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Owners and Managers can view audit logs" ON public.audit_logs;
CREATE POLICY "Owners and Managers can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (
        public.has_restaurant_role(restaurant_id, ARRAY['OWNER', 'MANAGER']::public.restaurant_user_role[])
    );

-- ============================================================================
-- 4. STORAGE BUCKETS SETUP & STORAGE RLS POLICIES
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('restaurant-kyc', 'restaurant-kyc', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
    ('restaurant-documents', 'restaurant-documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
    ('restaurant-menu-images', 'restaurant-menu-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: restaurant-kyc bucket (Only OWNER can upload and view)
DROP POLICY IF EXISTS "Owners can upload KYC docs" ON storage.objects;
CREATE POLICY "Owners can upload KYC docs"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'restaurant-kyc'
        AND auth.uid() IS NOT NULL
    );

DROP POLICY IF EXISTS "Owners can read own KYC docs" ON storage.objects;
CREATE POLICY "Owners can read own KYC docs"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'restaurant-kyc'
        AND auth.uid() IS NOT NULL
    );

-- Storage RLS: restaurant-menu-images (Public read, authenticated upload)
DROP POLICY IF EXISTS "Public can view menu images" ON storage.objects;
CREATE POLICY "Public can view menu images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'restaurant-menu-images');

DROP POLICY IF EXISTS "Staff can upload menu images" ON storage.objects;
CREATE POLICY "Staff can upload menu images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'restaurant-menu-images'
        AND auth.uid() IS NOT NULL
    );

-- ============================================================================
-- 5. REALTIME REPLICATION CONFIGURATION
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurants;
