-- Drop legacy can_manage_company_jobs column from recruiter_companies
-- This column has been superseded by the granular permissions JSONB column
-- which was added in 20260306000001_add_granular_permissions_to_recruiter_companies.sql

ALTER TABLE public.recruiter_companies
    DROP COLUMN IF EXISTS can_manage_company_jobs;
