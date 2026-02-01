-- Add company billing profiles and placement invoice tracking
-- Goal: Snapshot-driven billing + payout gating based on invoice collectibility

BEGIN;

-- Company billing configuration (1:1 with company)
CREATE TABLE IF NOT EXISTS company_billing_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    billing_terms TEXT NOT NULL CHECK (billing_terms IN ('immediate', 'net_30', 'net_60', 'net_90')),
    billing_email TEXT,
    invoice_delivery_method TEXT NOT NULL DEFAULT 'email'
        CHECK (invoice_delivery_method IN ('email', 'none')),
    stripe_customer_id TEXT,
    stripe_default_payment_method_id TEXT,
    stripe_tax_id TEXT,
    billing_contact_name TEXT,
    billing_address JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_company_billing_profiles_company_id
    ON company_billing_profiles(company_id);

CREATE INDEX IF NOT EXISTS idx_company_billing_profiles_terms
    ON company_billing_profiles(billing_terms);

-- Placement invoice tracking (1:1 with placement)
CREATE TABLE IF NOT EXISTS placement_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id UUID NOT NULL REFERENCES placements(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    billing_profile_id UUID REFERENCES company_billing_profiles(id) ON DELETE SET NULL,
    stripe_customer_id TEXT,
    stripe_invoice_id TEXT,
    stripe_invoice_number TEXT,
    invoice_status TEXT NOT NULL CHECK (invoice_status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
    amount_due NUMERIC(12,2) NOT NULL,
    amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'usd',
    collection_method TEXT NOT NULL CHECK (collection_method IN ('charge_automatically', 'send_invoice')),
    billing_terms TEXT NOT NULL CHECK (billing_terms IN ('immediate', 'net_30', 'net_60', 'net_90')),
    due_date DATE,
    collectible_at TIMESTAMPTZ,
    finalized_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    voided_at TIMESTAMPTZ,
    failure_reason TEXT,
    hosted_invoice_url TEXT,
    invoice_pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_placement_invoices_placement_id
    ON placement_invoices(placement_id);

CREATE INDEX IF NOT EXISTS idx_placement_invoices_company_id
    ON placement_invoices(company_id);

CREATE INDEX IF NOT EXISTS idx_placement_invoices_status
    ON placement_invoices(invoice_status);

CREATE INDEX IF NOT EXISTS idx_placement_invoices_due_date
    ON placement_invoices(due_date);

-- Updated at triggers
CREATE TRIGGER set_updated_at_company_billing_profiles
    BEFORE UPDATE ON company_billing_profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_column();

CREATE TRIGGER set_updated_at_placement_invoices
    BEFORE UPDATE ON placement_invoices
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at_column();

COMMIT;
