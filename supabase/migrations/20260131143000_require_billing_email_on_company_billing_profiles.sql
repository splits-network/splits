-- Require billing email for all company billing profiles
-- Ensures payment terms always have a billing contact

BEGIN;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM company_billing_profiles
        WHERE billing_email IS NULL OR billing_email = ''
    ) THEN
        RAISE EXCEPTION 'company_billing_profiles.billing_email must be set before applying NOT NULL constraint';
    END IF;
END $$;

ALTER TABLE company_billing_profiles
    ALTER COLUMN billing_email SET NOT NULL;

ALTER TABLE company_billing_profiles
    ADD CONSTRAINT company_billing_profiles_billing_email_not_blank
        CHECK (billing_email <> '');

COMMIT;
