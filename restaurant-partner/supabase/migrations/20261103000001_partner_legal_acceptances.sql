-- ============================================================================
-- FEEDO RESTAURANT PARTNER — MIGRATION: PARTNER LEGAL ACCEPTANCES
-- Records partner acceptance of Terms & Conditions and Privacy Policy
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.partner_legal_acceptances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
    terms_accepted BOOLEAN NOT NULL DEFAULT true,
    privacy_accepted BOOLEAN NOT NULL DEFAULT true,
    terms_version TEXT NOT NULL DEFAULT 'v2.4',
    privacy_version TEXT NOT NULL DEFAULT 'v2.4',
    ip_address TEXT,
    user_agent TEXT,
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for quick lookups by user and restaurant
CREATE INDEX IF NOT EXISTS idx_partner_legal_user_id ON public.partner_legal_acceptances(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_legal_restaurant_id ON public.partner_legal_acceptances(restaurant_id);

-- Enable RLS
ALTER TABLE public.partner_legal_acceptances ENABLE ROW LEVEL SECURITY;

-- Policies:
-- 1. Insert: authenticated users or onboarding applicants can record acceptance
CREATE POLICY "Allow insert of partner legal acceptances"
ON public.partner_legal_acceptances
FOR INSERT
WITH CHECK (true);

-- 2. Select: users can query their own legal acceptance
CREATE POLICY "Allow select of partner legal acceptances"
ON public.partner_legal_acceptances
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

