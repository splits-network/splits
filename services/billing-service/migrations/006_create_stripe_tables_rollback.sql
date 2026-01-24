-- Rollback Migration 006: Drop Stripe Connect and Company Billing tables
-- Date: 2026-01-24

-- Drop indexes
DROP INDEX IF EXISTS billing.idx_stripe_connect_accounts_user_id;
DROP INDEX IF EXISTS billing.idx_stripe_connect_accounts_stripe_id;
DROP INDEX IF EXISTS billing.idx_company_payment_terms_company_id;
DROP INDEX IF EXISTS billing.idx_company_payment_terms_stripe_customer_id;
DROP INDEX IF EXISTS billing.idx_promotion_charges_job_id;
DROP INDEX IF EXISTS billing.idx_promotion_charges_user_id;
DROP INDEX IF EXISTS billing.idx_promotion_charges_status;
DROP INDEX IF EXISTS billing.idx_promotion_charges_expires_at;

-- Drop tables
DROP TABLE IF EXISTS billing.promotion_charges;
DROP TABLE IF EXISTS billing.company_payment_terms;
DROP TABLE IF EXISTS billing.stripe_connect_accounts;
