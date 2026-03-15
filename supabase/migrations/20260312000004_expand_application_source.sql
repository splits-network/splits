-- Phase 1D: Expand application_source to support new flows
-- Adds 'company_recruiter' (company recruiter submits candidate)
-- and 'recommendation' (candidate applies from job recommendation)

ALTER TABLE "public"."applications"
  DROP CONSTRAINT "applications_application_source_check";

ALTER TABLE "public"."applications"
  ADD CONSTRAINT "applications_application_source_check"
  CHECK (application_source::text = ANY (ARRAY[
    'direct'::text,
    'recruiter'::text,
    'company_recruiter'::text,
    'recommendation'::text
  ]));
