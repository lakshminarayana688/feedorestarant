-- ============================================================================
-- FEEDO RESTAURANT PARTNER — DEVICE TOKENS & PUSH NOTIFICATIONS MIGRATION (04)
-- PostgreSQL 16 schema for Multi-Tenant FCM Device Tokens & Dispatch
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.restaurant_device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_token TEXT NOT NULL,
    device_type TEXT NOT NULL DEFAULT 'android' CHECK (device_type IN ('android', 'ios', 'web')),
    device_id TEXT,
    app_version TEXT DEFAULT '1.0.0',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (restaurant_id, device_token)
);

CREATE INDEX IF NOT EXISTS idx_device_tokens_restaurant ON public.restaurant_device_tokens(restaurant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_device_tokens_token ON public.restaurant_device_tokens(device_token);

CREATE OR REPLACE TRIGGER update_restaurant_device_tokens_modtime
    BEFORE UPDATE ON public.restaurant_device_tokens
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.restaurant_device_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Members can view their restaurant device tokens" ON public.restaurant_device_tokens;
CREATE POLICY "Members can view their restaurant device tokens"
    ON public.restaurant_device_tokens FOR SELECT
    USING (public.is_restaurant_member(restaurant_id));

DROP POLICY IF EXISTS "Members can insert device tokens" ON public.restaurant_device_tokens;
CREATE POLICY "Members can insert device tokens"
    ON public.restaurant_device_tokens FOR INSERT
    WITH CHECK (public.is_restaurant_member(restaurant_id) AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Members can update device tokens" ON public.restaurant_device_tokens;
CREATE POLICY "Members can update device tokens"
    ON public.restaurant_device_tokens FOR UPDATE
    USING (public.is_restaurant_member(restaurant_id))
    WITH CHECK (public.is_restaurant_member(restaurant_id));

DROP POLICY IF EXISTS "Members can delete device tokens on logout" ON public.restaurant_device_tokens;
CREATE POLICY "Members can delete device tokens on logout"
    ON public.restaurant_device_tokens FOR DELETE
    USING (public.is_restaurant_member(restaurant_id));
