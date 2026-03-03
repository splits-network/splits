-- Remove denormalized candidate fields from recruiter_candidates
-- These columns (candidate_name, candidate_email, candidate_location, candidate_linkedin_url)
-- duplicate data from the candidates table via candidate_id FK.
-- The repository already JOINs to candidates for all reads.
-- These columns only fed search_vector and search_index triggers.

-- 1. Rewrite the BEFORE INSERT/UPDATE trigger to JOIN candidates for search data
CREATE OR REPLACE FUNCTION public.update_recruiter_candidate_search_vector()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_name text;
    v_email text;
    v_location text;
BEGIN
    IF NEW.candidate_id IS NOT NULL THEN
        SELECT c.full_name, c.email, c.location
        INTO v_name, v_email, v_location
        FROM public.candidates c
        WHERE c.id = NEW.candidate_id;
    END IF;

    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(v_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(v_email, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(v_location, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.status, '')), 'D');
    RETURN NEW;
END;
$$;

-- 2. Rewrite cascade trigger from candidates table — only rebuild search_vector
CREATE OR REPLACE FUNCTION public.sync_recruiter_candidate_search_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.recruiter_candidates rc
    SET search_vector =
        setweight(to_tsvector('english', COALESCE(NEW.full_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.email, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(rc.status, '')), 'D')
    WHERE rc.candidate_id = NEW.id;
    RETURN NEW;
END;
$$;

-- 3. Rewrite search index sync to JOIN candidates for data
CREATE OR REPLACE FUNCTION search.sync_recruiter_candidate_to_search_index()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_recruiter_name text;
    v_candidate_name text;
    v_candidate_email text;
    v_candidate_location text;
BEGIN
    -- Lookup candidate data via JOIN
    IF NEW.candidate_id IS NOT NULL THEN
        SELECT c.full_name, c.email, c.location
        INTO v_candidate_name, v_candidate_email, v_candidate_location
        FROM public.candidates c
        WHERE c.id = NEW.candidate_id;
    END IF;

    -- Lookup recruiter name
    SELECT u.name INTO v_recruiter_name
    FROM public.users u
    JOIN public.recruiters r ON r.user_id = u.id
    WHERE r.id = NEW.recruiter_id;

    INSERT INTO search.search_index (entity_type, entity_id, title, subtitle, context, search_vector, metadata, organization_id, updated_at)
    VALUES (
        'recruiter_candidate',
        NEW.id,
        COALESCE(v_candidate_name, ''),
        CONCAT_WS(' - Recruiter: ', NULLIF(v_candidate_location, ''), v_recruiter_name),
        CONCAT_WS(' ', v_candidate_name, v_candidate_email, v_candidate_location, NEW.status, v_recruiter_name),
        NEW.search_vector,
        jsonb_build_object(
            'candidate_name', v_candidate_name,
            'candidate_email', v_candidate_email,
            'candidate_location', v_candidate_location,
            'status', NEW.status,
            'recruiter_name', v_recruiter_name,
            'recruiter_id', NEW.recruiter_id
        ),
        NULL,
        now()
    )
    ON CONFLICT (entity_type, entity_id)
    DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        context = EXCLUDED.context,
        search_vector = EXCLUDED.search_vector,
        metadata = EXCLUDED.metadata,
        updated_at = EXCLUDED.updated_at;
    RETURN NEW;
END;
$$;

-- 4. Drop the old build function (no longer needed — logic is inline in triggers)
DROP FUNCTION IF EXISTS public.build_recruiter_candidate_search_vector(text, text, text, text);

-- 5. Drop denormalized columns
ALTER TABLE public.recruiter_candidates
    DROP COLUMN IF EXISTS candidate_name,
    DROP COLUMN IF EXISTS candidate_email,
    DROP COLUMN IF EXISTS candidate_location,
    DROP COLUMN IF EXISTS candidate_linkedin_url;

-- 6. Backfill search vectors with correct joined data
UPDATE public.recruiter_candidates rc
SET search_vector = (
    SELECT
        setweight(to_tsvector('english', COALESCE(c.full_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(c.email, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(c.location, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(rc.status, '')), 'D')
    FROM public.candidates c
    WHERE c.id = rc.candidate_id
)
WHERE rc.candidate_id IS NOT NULL;
