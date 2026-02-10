-- Fix sync_applications_job_data function to remove references to non-existent notes columns
-- The function was trying to reference a.notes, a.recruiter_notes, and a.candidate_notes
-- but these columns don't exist in the applications table anymore (moved to application_notes table)
--
-- This fixes the 500 error when updating jobs: "column a.notes does not exist"

CREATE OR REPLACE FUNCTION public.sync_applications_job_data()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE public.applications a
    SET 
        job_title = NEW.title,
        company_name = NEW.company_name,
        search_vector = build_applications_search_vector(
            a.candidate_name,
            a.candidate_email,
            NEW.title,
            NEW.company_name,
            a.stage
        )
    WHERE a.job_id = NEW.id;
    RETURN NEW;
END;
$function$;