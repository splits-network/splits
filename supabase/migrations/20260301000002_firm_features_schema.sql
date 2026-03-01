-- Phase 1: Database schema changes for firm features
-- Adds: admin take rate, off-platform jobs, firm billing, per-role firm snapshot fields

BEGIN;

-- ============================================================
-- 1. firms.admin_take_rate
-- ============================================================
ALTER TABLE public.firms
    ADD COLUMN admin_take_rate NUMERIC(5,2) NOT NULL DEFAULT 0
    CONSTRAINT firms_admin_take_rate_range CHECK (admin_take_rate >= 0 AND admin_take_rate <= 100);

-- ============================================================
-- 2. jobs: off-platform company support
--    company_id is already nullable, just add source_firm_id
-- ============================================================
ALTER TABLE public.jobs
    ADD COLUMN source_firm_id UUID REFERENCES firms(id);

CREATE INDEX idx_jobs_source_firm ON public.jobs(source_firm_id)
    WHERE source_firm_id IS NOT NULL;

COMMENT ON COLUMN public.jobs.source_firm_id
    IS 'Set when a firm member creates a job for a company not on the platform (off-platform job)';

-- ============================================================
-- 3. firm_billing_profiles (mirrors company_billing_profiles)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.firm_billing_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    billing_terms TEXT NOT NULL CHECK (billing_terms IN ('immediate', 'net_30', 'net_60', 'net_90')),
    billing_email TEXT NOT NULL,
    invoice_delivery_method TEXT NOT NULL DEFAULT 'email'
        CHECK (invoice_delivery_method IN ('email', 'manual')),
    stripe_customer_id TEXT,
    stripe_default_payment_method_id TEXT,
    stripe_tax_id TEXT,
    billing_contact_name TEXT,
    billing_address JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_firm_billing_profiles_firm_id
    ON public.firm_billing_profiles(firm_id);

CREATE INDEX idx_firm_billing_profiles_terms
    ON public.firm_billing_profiles(billing_terms);

CREATE TRIGGER set_updated_at_firm_billing_profiles
    BEFORE UPDATE ON public.firm_billing_profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_column();

ALTER TABLE public.firm_billing_profiles ENABLE ROW LEVEL SECURITY;

-- Firm admins/owners can manage billing profiles
CREATE POLICY firm_billing_profiles_select_policy ON public.firm_billing_profiles
    FOR SELECT USING (
        firm_id IN (
            SELECT fm.firm_id
            FROM public.firm_members fm
            JOIN public.recruiters r ON r.id = fm.recruiter_id
            WHERE r.user_id = auth.uid() AND fm.status = 'active'
        )
    );

CREATE POLICY firm_billing_profiles_modify_policy ON public.firm_billing_profiles
    USING (
        firm_id IN (
            SELECT fm.firm_id
            FROM public.firm_members fm
            JOIN public.recruiters r ON r.id = fm.recruiter_id
            WHERE r.user_id = auth.uid()
              AND fm.status = 'active'
              AND fm.role IN ('owner', 'admin')
        )
    );

COMMENT ON TABLE public.firm_billing_profiles IS 'Billing configuration for firms (Stripe Customer for invoicing)';

-- ============================================================
-- 4. firm_stripe_accounts (Stripe Connect for receiving payouts)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.firm_stripe_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    stripe_connect_account_id TEXT,
    stripe_connect_onboarded BOOLEAN NOT NULL DEFAULT false,
    onboarded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_firm_stripe_accounts_firm_id
    ON public.firm_stripe_accounts(firm_id);

CREATE TRIGGER set_updated_at_firm_stripe_accounts
    BEFORE UPDATE ON public.firm_stripe_accounts
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_column();

ALTER TABLE public.firm_stripe_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY firm_stripe_accounts_select_policy ON public.firm_stripe_accounts
    FOR SELECT USING (
        firm_id IN (
            SELECT fm.firm_id
            FROM public.firm_members fm
            JOIN public.recruiters r ON r.id = fm.recruiter_id
            WHERE r.user_id = auth.uid() AND fm.status = 'active'
        )
    );

CREATE POLICY firm_stripe_accounts_modify_policy ON public.firm_stripe_accounts
    USING (
        firm_id IN (
            SELECT fm.firm_id
            FROM public.firm_members fm
            JOIN public.recruiters r ON r.id = fm.recruiter_id
            WHERE r.user_id = auth.uid()
              AND fm.status = 'active'
              AND fm.role IN ('owner', 'admin')
        )
    );

COMMENT ON TABLE public.firm_stripe_accounts IS 'Stripe Connect accounts for firms to receive admin take payouts';

-- ============================================================
-- 5. placement_snapshot: per-role firm fields
-- ============================================================
ALTER TABLE public.placement_snapshot
    ADD COLUMN candidate_recruiter_firm_id UUID REFERENCES firms(id),
    ADD COLUMN candidate_recruiter_admin_take_rate NUMERIC(5,2),
    ADD COLUMN company_recruiter_firm_id UUID REFERENCES firms(id),
    ADD COLUMN company_recruiter_admin_take_rate NUMERIC(5,2),
    ADD COLUMN job_owner_firm_id UUID REFERENCES firms(id),
    ADD COLUMN job_owner_admin_take_rate NUMERIC(5,2),
    ADD COLUMN candidate_sourcer_firm_id UUID REFERENCES firms(id),
    ADD COLUMN candidate_sourcer_admin_take_rate NUMERIC(5,2),
    ADD COLUMN company_sourcer_firm_id UUID REFERENCES firms(id),
    ADD COLUMN company_sourcer_admin_take_rate NUMERIC(5,2);

-- ============================================================
-- 6. placement_splits: firm take tracking
-- ============================================================
ALTER TABLE public.placement_splits
    ADD COLUMN firm_admin_take_rate NUMERIC(5,2),
    ADD COLUMN firm_admin_take_amount NUMERIC(12,2),
    ADD COLUMN net_amount NUMERIC(12,2);

COMMENT ON COLUMN public.placement_splits.firm_admin_take_rate IS 'Frozen firm take rate at time of split calculation';
COMMENT ON COLUMN public.placement_splits.firm_admin_take_amount IS 'split_amount * firm_admin_take_rate / 100';
COMMENT ON COLUMN public.placement_splits.net_amount IS 'split_amount - firm_admin_take_amount (what the member actually receives)';

-- ============================================================
-- 7. placement_payout_transactions: type + firm_id
-- ============================================================
ALTER TABLE public.placement_payout_transactions
    ADD COLUMN transaction_type TEXT NOT NULL DEFAULT 'member_payout'
        CONSTRAINT payout_transaction_type_check
        CHECK (transaction_type IN ('member_payout', 'firm_admin_take')),
    ADD COLUMN firm_id UUID REFERENCES firms(id);

CREATE INDEX idx_payout_transactions_firm
    ON public.placement_payout_transactions(firm_id)
    WHERE firm_id IS NOT NULL;

CREATE INDEX idx_payout_transactions_type
    ON public.placement_payout_transactions(transaction_type);

-- ============================================================
-- 8. placement_invoices: firm_id + make company_id nullable
-- ============================================================
ALTER TABLE public.placement_invoices
    ALTER COLUMN company_id DROP NOT NULL;

ALTER TABLE public.placement_invoices
    ADD COLUMN firm_id UUID REFERENCES firms(id);

CREATE INDEX idx_placement_invoices_firm
    ON public.placement_invoices(firm_id)
    WHERE firm_id IS NOT NULL;

-- Either company_id or firm_id must be set (invoice must be billed to someone)
ALTER TABLE public.placement_invoices
    ADD CONSTRAINT placement_invoices_billable_entity_check
    CHECK (company_id IS NOT NULL OR firm_id IS NOT NULL);

COMMENT ON COLUMN public.placement_invoices.firm_id
    IS 'Set for off-platform job placements where the firm is billed instead of a company';

COMMIT;
