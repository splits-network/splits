-- Migration 006: Create Stripe Connect and Company Billing Tables
-- Date: 2026-01-22
-- Description: Create tables for Stripe Connect accounts and company billing

-- Create stripe_connect_accounts table
CREATE TABLE IF NOT EXISTS billing.stripe_connect_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References identity.users(id)
    stripe_account_id TEXT NOT NULL UNIQUE,
    account_status TEXT NOT NULL CHECK (account_status IN ('pending', 'restricted', 'enabled')),
    charges_enabled BOOLEAN DEFAULT false,
    payouts_enabled BOOLEAN DEFAULT false,
    verification_status TEXT,
    verification_requirements JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create company_payment_terms table  
CREATE TABLE IF NOT EXISTS billing.company_payment_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL, -- References ats.companies(id)
    payment_method TEXT NOT NULL CHECK (payment_method IN ('immediate', 'net_30', 'net_60', 'net_90')),
    stripe_customer_id TEXT,
    default_terms BOOLEAN DEFAULT false,
    billing_contact_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Only one default per company
    UNIQUE(company_id, default_terms) DEFERRABLE INITIALLY DEFERRED
);

-- Create promotion_charges table
CREATE TABLE IF NOT EXISTS billing.promotion_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL, -- References ats.jobs(id)
    user_id UUID NOT NULL, -- References identity.users(id) 
    stripe_payment_intent_id TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'usd',
    duration_days INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
    expires_at TIMESTAMPTZ,
    promotion_type TEXT DEFAULT 'featured' CHECK (promotion_type IN ('featured', 'urgent', 'priority')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stripe_connect_accounts_user_id ON billing.stripe_connect_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_connect_accounts_stripe_id ON billing.stripe_connect_accounts(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_company_payment_terms_company_id ON billing.company_payment_terms(company_id);
CREATE INDEX IF NOT EXISTS idx_company_payment_terms_stripe_customer_id ON billing.company_payment_terms(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_promotion_charges_job_id ON billing.promotion_charges(job_id);
CREATE INDEX IF NOT EXISTS idx_promotion_charges_user_id ON billing.promotion_charges(user_id);
CREATE INDEX IF NOT EXISTS idx_promotion_charges_status ON billing.promotion_charges(status);
CREATE INDEX IF NOT EXISTS idx_promotion_charges_expires_at ON billing.promotion_charges(expires_at);