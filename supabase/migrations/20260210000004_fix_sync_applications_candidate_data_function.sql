-- Fix sync_applications_candidate_data function to remove references to non-existent notes columns
-- The function was trying to reference a.notes, a.recruiter_notes, and a.candidate_notes
-- but these columns don't exist in the applications table anymore (moved to application_notes table)
--
-- This fixes the 400 error when updating candidates: "column a.notes does not exist"
-- The trigger fires on UPDATE OF full_name, email on candidates table

CREATE OR REPLACE FUNCTION public.sync_applications_candidate_data()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE public.applications a
    SET
        candidate_name = NEW.full_name,
        candidate_email = NEW.email,
        search_vector = build_applications_search_vector(
            NEW.full_name,
            NEW.email,
            a.job_title,
            a.company_name,
            a.stage
        )
    WHERE a.candidate_id = NEW.id;
    RETURN NEW;
END;
$function$;
