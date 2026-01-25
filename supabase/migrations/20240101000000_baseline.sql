


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "analytics";


ALTER SCHEMA "analytics" OWNER TO "postgres";


COMMENT ON SCHEMA "analytics" IS 'Analytics schema for event-driven metrics aggregation';



COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."document_type" AS ENUM (
    'resume',
    'cover_letter',
    'job_description',
    'company_document',
    'contract',
    'invoice',
    'receipt',
    'agreement',
    'other',
    'offer_letter'
);


ALTER TYPE "public"."document_type" OWNER TO "postgres";


CREATE TYPE "public"."entity_type" AS ENUM (
    'candidate',
    'job',
    'application',
    'company',
    'placement',
    'contract',
    'invoice'
);


ALTER TYPE "public"."entity_type" OWNER TO "postgres";


CREATE TYPE "public"."processing_status" AS ENUM (
    'pending',
    'processing',
    'processed',
    'failed'
);


ALTER TYPE "public"."processing_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "analytics"."get_chart_metrics"("p_metric_types" "text"[], "p_start_date" "date", "p_end_date" "date", "p_recruiter_id" "uuid" DEFAULT NULL::"uuid", "p_company_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("metric_type" "text", "time_value" "text", "value" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.metric_type::TEXT,
        m.time_value::TEXT,
        m.value
    FROM analytics.metrics_monthly m
    WHERE m.metric_type = ANY(p_metric_types)
      AND m.time_value >= p_start_date
      AND m.time_value <= p_end_date
      AND (p_recruiter_id IS NULL OR m.dimension_recruiter_id = p_recruiter_id)
      AND (p_company_id IS NULL OR m.dimension_company_id = p_company_id)
    ORDER BY m.time_value ASC;
END;
$$;


ALTER FUNCTION "analytics"."get_chart_metrics"("p_metric_types" "text"[], "p_start_date" "date", "p_end_date" "date", "p_recruiter_id" "uuid", "p_company_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."build_applications_search_vector"("p_candidate_name" "text", "p_candidate_email" "text", "p_job_title" "text", "p_company_name" "text", "p_notes" "text", "p_stage" "text", "p_recruiter_notes" "text", "p_candidate_notes" "text") RETURNS "tsvector"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
    RETURN
        setweight(to_tsvector('english', COALESCE(p_candidate_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(p_job_title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(p_candidate_email, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_company_name, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_notes, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_stage, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_recruiter_notes, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_candidate_notes, '')), 'C');
END;
$$;


ALTER FUNCTION "public"."build_applications_search_vector"("p_candidate_name" "text", "p_candidate_email" "text", "p_job_title" "text", "p_company_name" "text", "p_notes" "text", "p_stage" "text", "p_recruiter_notes" "text", "p_candidate_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."build_candidates_search_vector"("p_full_name" "text", "p_email" "text", "p_current_title" "text", "p_current_company" "text", "p_skills" "text", "p_bio" "text", "p_location" "text", "p_phone" "text", "p_desired_job_type" "text", "p_linkedin_url" "text", "p_github_url" "text", "p_portfolio_url" "text") RETURNS "tsvector"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
    RETURN
        setweight(to_tsvector('english', COALESCE(p_full_name, '')), 'A') ||
        -- Replace special chars in email with spaces so "test2" can match "bkorous+test2@gmail.com"
        setweight(to_tsvector('simple', COALESCE(regexp_replace(p_email, '[@+._-]', ' ', 'g'), '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_current_title, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_current_company, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_skills, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_bio, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_location, '')), 'C') ||
        -- Replace special chars in phone for partial matching
        setweight(to_tsvector('simple', COALESCE(regexp_replace(p_phone, '[^0-9]', ' ', 'g'), '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_desired_job_type, '')), 'C') ||
        -- Replace special chars in URLs for partial matching
        setweight(to_tsvector('simple', COALESCE(regexp_replace(p_linkedin_url, '[/:._-]', ' ', 'g'), '')), 'D') ||
        setweight(to_tsvector('simple', COALESCE(regexp_replace(p_github_url, '[/:._-]', ' ', 'g'), '')), 'D') ||
        setweight(to_tsvector('simple', COALESCE(regexp_replace(p_portfolio_url, '[/:._-]', ' ', 'g'), '')), 'D');
END;
$$;


ALTER FUNCTION "public"."build_candidates_search_vector"("p_full_name" "text", "p_email" "text", "p_current_title" "text", "p_current_company" "text", "p_skills" "text", "p_bio" "text", "p_location" "text", "p_phone" "text", "p_desired_job_type" "text", "p_linkedin_url" "text", "p_github_url" "text", "p_portfolio_url" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."build_companies_search_vector"("p_name" "text", "p_description" "text", "p_industry" "text", "p_headquarters_location" "text", "p_company_size" "text", "p_website" "text") RETURNS "tsvector"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
    RETURN
        setweight(to_tsvector('english', COALESCE(p_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(p_description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_industry, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_headquarters_location, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_company_size, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_website, '')), 'C');
END;
$$;


ALTER FUNCTION "public"."build_companies_search_vector"("p_name" "text", "p_description" "text", "p_industry" "text", "p_headquarters_location" "text", "p_company_size" "text", "p_website" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."build_jobs_search_vector"("p_title" "text", "p_description" "text", "p_recruiter_description" "text", "p_candidate_description" "text", "p_location" "text", "p_company_name" "text", "p_company_industry" "text", "p_company_headquarters_location" "text", "p_employment_type" "text", "p_department" "text", "p_status" "text", "p_requirements_text" "text") RETURNS "tsvector"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
    RETURN
        setweight(to_tsvector('english', COALESCE(p_title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(p_company_name, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_recruiter_description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_candidate_description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_requirements_text, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_location, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_company_industry, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_company_headquarters_location, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_employment_type, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_department, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_status, '')), 'D');
END;
$$;


ALTER FUNCTION "public"."build_jobs_search_vector"("p_title" "text", "p_description" "text", "p_recruiter_description" "text", "p_candidate_description" "text", "p_location" "text", "p_company_name" "text", "p_company_industry" "text", "p_company_headquarters_location" "text", "p_employment_type" "text", "p_department" "text", "p_status" "text", "p_requirements_text" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."build_jobs_search_vector"("p_job_id" "uuid", "p_title" "text", "p_description" "text", "p_recruiter_description" "text", "p_candidate_description" "text", "p_location" "text", "p_department" "text", "p_employment_type" "text", "p_company_name" "text", "p_company_industry" "text", "p_company_headquarters_location" "text", "p_status" "text") RETURNS "tsvector"
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
    requirements_text TEXT;
BEGIN
    -- Query job_requirements and concatenate for search
    SELECT string_agg(
        COALESCE(requirement_type, '') || ' ' || 
        COALESCE(description, ''),
        ' '
    ) INTO requirements_text
    FROM public.job_requirements
    WHERE job_id = p_job_id;
    
    -- Build weighted search vector including requirements
    RETURN 
        setweight(to_tsvector('english', COALESCE(p_title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(p_description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_recruiter_description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_candidate_description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_company_name, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(requirements_text, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_location, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_company_industry, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_company_headquarters_location, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_employment_type, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_department, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_status, '')), 'D');
END;
$$;


ALTER FUNCTION "public"."build_jobs_search_vector"("p_job_id" "uuid", "p_title" "text", "p_description" "text", "p_recruiter_description" "text", "p_candidate_description" "text", "p_location" "text", "p_department" "text", "p_employment_type" "text", "p_company_name" "text", "p_company_industry" "text", "p_company_headquarters_location" "text", "p_status" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."build_placements_search_vector"("p_candidate_name" "text", "p_candidate_email" "text", "p_job_title" "text", "p_company_name" "text", "p_recruiter_name" "text", "p_recruiter_email" "text", "p_state" "text", "p_salary" numeric, "p_failure_reason" "text") RETURNS "tsvector"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
    RETURN
        setweight(to_tsvector('english', COALESCE(p_candidate_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(p_job_title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(p_company_name, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_candidate_email, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_recruiter_name, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_recruiter_email, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_state, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_salary::TEXT, '')), 'D') ||
        setweight(to_tsvector('english', COALESCE(p_failure_reason, '')), 'D');
END;
$$;


ALTER FUNCTION "public"."build_placements_search_vector"("p_candidate_name" "text", "p_candidate_email" "text", "p_job_title" "text", "p_company_name" "text", "p_recruiter_name" "text", "p_recruiter_email" "text", "p_state" "text", "p_salary" numeric, "p_failure_reason" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."build_recruiter_candidate_search_vector"("p_candidate_name" "text", "p_candidate_email" "text", "p_candidate_location" "text", "p_status" "text") RETURNS "tsvector"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
  RETURN 
    setweight(to_tsvector('english', COALESCE(p_candidate_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(p_candidate_email, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(p_candidate_location, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(p_status, '')), 'D');
END;
$$;


ALTER FUNCTION "public"."build_recruiter_candidate_search_vector"("p_candidate_name" "text", "p_candidate_email" "text", "p_candidate_location" "text", "p_status" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."build_recruiters_search_vector"("p_recruiter_id" "uuid") RETURNS "tsvector"
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
  v_user_name text;
  v_user_email text;
  v_bio text;
  v_tagline text;
  v_industries text;
  v_specialties text;
  v_location text;
  v_phone text;
BEGIN
  -- Fetch user data inline (no denormalization)
  SELECT u.name, u.email
  INTO v_user_name, v_user_email
  FROM public.users u
  JOIN public.recruiters r ON r.user_id = u.id
  WHERE r.id = p_recruiter_id;
  
  -- Fetch recruiter data
  SELECT 
    bio, 
    tagline, 
    array_to_string(industries, ' '), 
    array_to_string(specialties, ' '), 
    location, 
    phone
  INTO v_bio, v_tagline, v_industries, v_specialties, v_location, v_phone
  FROM public.recruiters
  WHERE id = p_recruiter_id;
  
  RETURN 
    -- Weight A: Name (highest priority - recruiter identity)
    setweight(to_tsvector('english', COALESCE(v_user_name, '')), 'A') ||
    
    -- Weight B: Email, Bio, Tagline (high priority - contact and expertise)
    -- Email: Use 'simple' config with regexp_replace to split on special chars
    -- Enables partial matching (e.g., "test2" finds "bkorous+test2@gmail.com")
    setweight(to_tsvector('simple', COALESCE(regexp_replace(v_user_email, '[@+._-]', ' ', 'g'), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(v_bio, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(v_tagline, '')), 'B') ||
    
    -- Weight C: Industries, Specialties, Location (medium priority)
    setweight(to_tsvector('english', COALESCE(v_industries, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(v_specialties, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(v_location, '')), 'C') ||
    
    -- Weight D: Phone (low priority - use 'simple' with digit extraction)
    setweight(to_tsvector('simple', COALESCE(regexp_replace(v_phone, '[^0-9]', ' ', 'g'), '')), 'D');
END;
$$;


ALTER FUNCTION "public"."build_recruiters_search_vector"("p_recruiter_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."candidate_matches_search"("candidate_id" "uuid", "search_term" "text") RETURNS boolean
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
  candidate_record RECORD;
BEGIN
  SELECT full_name, email INTO candidate_record
  FROM public.candidates
  WHERE id = candidate_id;
  
  RETURN (
    candidate_record.full_name ILIKE '%' || search_term || '%' OR
    candidate_record.email ILIKE '%' || search_term || '%'
  );
END;
$$;


ALTER FUNCTION "public"."candidate_matches_search"("candidate_id" "uuid", "search_term" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_vault_secret"("secret_value" "text", "secret_name" "text", "secret_description" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    secret_id UUID;
BEGIN
    SELECT vault.create_secret(secret_value, secret_name, secret_description)
    INTO secret_id;
    
    RETURN secret_id;
END;
$$;


ALTER FUNCTION "public"."create_vault_secret"("secret_value" "text", "secret_name" "text", "secret_description" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."create_vault_secret"("secret_value" "text", "secret_name" "text", "secret_description" "text") IS 'Create a new secret in Vault. Wrapper for vault.create_secret.';


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."integrations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "platform" "text" NOT NULL,
    "api_key_encrypted" "text" NOT NULL,
    "api_base_url" "text",
    "webhook_url" "text",
    "webhook_secret" "text",
    "sync_enabled" boolean DEFAULT true NOT NULL,
    "sync_roles" boolean DEFAULT true NOT NULL,
    "sync_candidates" boolean DEFAULT true NOT NULL,
    "sync_applications" boolean DEFAULT true NOT NULL,
    "sync_interviews" boolean DEFAULT false NOT NULL,
    "last_synced_at" timestamp with time zone,
    "last_sync_error" "text",
    "config" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "integrations_platform_check" CHECK (("platform" = ANY (ARRAY['greenhouse'::"text", 'lever'::"text", 'workable'::"text", 'ashby'::"text", 'generic'::"text"])))
);


ALTER TABLE "public"."integrations" OWNER TO "postgres";


COMMENT ON TABLE "public"."integrations" IS 'ATS platform integrations for companies (Greenhouse, Lever, etc.)';



COMMENT ON COLUMN "public"."integrations"."api_key_encrypted" IS 'API key encrypted with application secret, never exposed to frontend';



CREATE OR REPLACE FUNCTION "public"."get_integration_by_company_platform"("p_company_id" "uuid", "p_platform" "text") RETURNS "public"."integrations"
    LANGUAGE "sql" STABLE
    AS $$
    SELECT * FROM integrations
    WHERE company_id = p_company_id AND platform = p_platform
    LIMIT 1;
$$;


ALTER FUNCTION "public"."get_integration_by_company_platform"("p_company_id" "uuid", "p_platform" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_secret"("secret_name" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    secret_value TEXT;
BEGIN
    SELECT decrypted_secret INTO secret_value
    FROM vault.decrypted_secrets
    WHERE name = secret_name;
    
    RETURN secret_value;
END;
$$;


ALTER FUNCTION "public"."get_secret"("secret_name" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_secret"("secret_name" "text") IS 'Retrieve a decrypted secret value by name. Only accessible to service_role.';



CREATE OR REPLACE FUNCTION "public"."map_external_to_internal"("p_integration_id" "uuid", "p_entity_type" "text", "p_external_id" "text") RETURNS "uuid"
    LANGUAGE "sql" STABLE
    AS $$
    SELECT internal_id FROM external_entity_map
    WHERE integration_id = p_integration_id
      AND entity_type = p_entity_type
      AND external_id = p_external_id
    LIMIT 1;
$$;


ALTER FUNCTION "public"."map_external_to_internal"("p_integration_id" "uuid", "p_entity_type" "text", "p_external_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."map_internal_to_external"("p_integration_id" "uuid", "p_entity_type" "text", "p_internal_id" "uuid") RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
    SELECT external_id FROM external_entity_map
    WHERE integration_id = p_integration_id
      AND entity_type = p_entity_type
      AND internal_id = p_internal_id
    LIMIT 1;
$$;


ALTER FUNCTION "public"."map_internal_to_external"("p_integration_id" "uuid", "p_entity_type" "text", "p_internal_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_applications_candidate_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
            a.notes,
            a.stage,
            a.recruiter_notes,
            a.candidate_notes
        )
    WHERE a.candidate_id = NEW.id;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_applications_candidate_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_applications_job_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
            a.notes,
            a.stage,
            a.recruiter_notes,
            a.candidate_notes
        )
    WHERE a.job_id = NEW.id;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_applications_job_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_jobs_company_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- When company changes, rebuild search vector for all jobs at that company
  UPDATE public.jobs j
  SET 
    company_name = NEW.name,
    company_industry = NEW.industry,
    company_headquarters_location = NEW.headquarters_location,
    search_vector = build_jobs_search_vector(
      j.id,  -- job_id for requirements query
      j.title,
      j.description,
      j.recruiter_description,
      j.candidate_description,
      j.location,
      j.department,
      j.employment_type,
      NEW.name,  -- updated company name
      NEW.industry,  -- updated company industry
      NEW.headquarters_location,  -- updated company location
      j.status
    )
  WHERE j.company_id = NEW.id;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_jobs_company_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_placements_candidate_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE public.placements
    SET 
        candidate_name = NEW.full_name,
        candidate_email = NEW.email,
        search_vector = build_placements_search_vector(
            NEW.full_name,
            NEW.email,
            job_title,
            company_name,
            recruiter_name,
            recruiter_email,
            state,
            salary,
            failure_reason
        )
    WHERE candidate_id = NEW.id;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_placements_candidate_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_placements_company_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE public.placements p
    SET 
        company_name = NEW.name,
        search_vector = build_placements_search_vector(
            p.candidate_name,
            p.candidate_email,
            p.job_title,
            NEW.name,
            p.recruiter_name,
            p.recruiter_email,
            p.state,
            p.salary,
            p.failure_reason
        )
    FROM public.jobs j
    WHERE p.job_id = j.id AND j.company_id = NEW.id;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_placements_company_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_placements_job_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_company_name TEXT;
BEGIN
    -- Get company name from companies table
    SELECT c.name INTO v_company_name
    FROM public.companies c
    WHERE c.id = NEW.company_id;
    
    UPDATE public.placements
    SET 
        job_title = NEW.title,
        company_name = v_company_name,
        search_vector = build_placements_search_vector(
            candidate_name,
            candidate_email,
            NEW.title,
            v_company_name,
            recruiter_name,
            recruiter_email,
            state,
            salary,
            failure_reason
        )
    WHERE job_id = NEW.id;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_placements_job_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_placements_recruiter_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE public.placements p
    SET 
        recruiter_name = NEW.name,
        recruiter_email = NEW.email,
        search_vector = build_placements_search_vector(
            p.candidate_name,
            p.candidate_email,
            p.job_title,
            p.company_name,
            NEW.name,
            NEW.email,
            p.state,
            p.salary,
            p.failure_reason
        )
    FROM public.recruiters r
    WHERE p.recruiter_id = r.id AND r.user_id = NEW.id;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_placements_recruiter_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_recruiter_candidate_search_fields"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- When candidate changes, update all recruiter_candidates rows
  UPDATE public.recruiter_candidates rc
  SET 
    candidate_name = NEW.full_name,
    candidate_email = NEW.email,
    candidate_location = NEW.location,
    candidate_linkedin_url = NEW.linkedin_url,
    search_vector = build_recruiter_candidate_search_vector(
      NEW.full_name,
      NEW.email,
      NEW.location,
      rc.status
    )
  WHERE rc.candidate_id = NEW.id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_recruiter_candidate_search_fields"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_recruiter_user_search_vector"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- When user name/email changes, rebuild search vector for all their recruiter profiles
  UPDATE public.recruiters
  SET search_vector = build_recruiters_search_vector(id)
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_recruiter_user_search_vector"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_applications_search_vector"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.search_vector := build_applications_search_vector(
        NEW.candidate_name,
        NEW.candidate_email,
        NEW.job_title,
        NEW.company_name,
        NEW.notes,
        NEW.stage,
        NEW.recruiter_notes,
        NEW.candidate_notes
    );
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_applications_search_vector"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_candidates_search_vector"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.search_vector := build_candidates_search_vector(
        NEW.full_name,
        NEW.email,
        NEW.current_title,
        NEW.current_company,
        NEW.skills,
        NEW.bio,
        NEW.location,
        NEW.phone,
        NEW.desired_job_type,
        NEW.linkedin_url,
        NEW.github_url,
        NEW.portfolio_url
    );
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_candidates_search_vector"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_companies_search_vector"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.search_vector := build_companies_search_vector(
        NEW.name,
        NEW.description,
        NEW.industry,
        NEW.headquarters_location,
        NEW.company_size,
        NEW.website
    );
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_companies_search_vector"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_job_search_on_requirements_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Update the parent job's search_vector when requirements change
    UPDATE public.jobs
    SET search_vector = build_jobs_search_vector(
        id,
        title,
        description,
        recruiter_description,
        candidate_description,
        location,
        department,
        employment_type,
        company_name,
        company_industry,
        company_headquarters_location,
        status
    )
    WHERE id = COALESCE(NEW.job_id, OLD.job_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_job_search_on_requirements_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_jobs_search_vector"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.search_vector := build_jobs_search_vector(
    NEW.id,  -- job_id for requirements query
    NEW.title,
    NEW.description,
    NEW.recruiter_description,
    NEW.candidate_description,
    NEW.location,
    NEW.department,
    NEW.employment_type,
    NEW.company_name,
    NEW.company_industry,
    NEW.company_headquarters_location,
    NEW.status
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_jobs_search_vector"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_placement_payout_transaction_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_placement_payout_transaction_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_placements_search_vector"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.search_vector := build_placements_search_vector(
        NEW.candidate_name,
        NEW.candidate_email,
        NEW.job_title,
        NEW.company_name,
        NEW.recruiter_name,
        NEW.recruiter_email,
        NEW.state,
        NEW.salary,
        NEW.failure_reason
    );
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_placements_search_vector"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_recruiter_candidate_search_vector"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.search_vector := build_recruiter_candidate_search_vector(
    NEW.candidate_name,
    NEW.candidate_email,
    NEW.candidate_location,
    NEW.status
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_recruiter_candidate_search_vector"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_recruiters_search_vector"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.search_vector := build_recruiters_search_vector(NEW.id);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_recruiters_search_vector"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_vault_secret"("secret_name" "text", "new_value" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    secret_id UUID;
    old_description TEXT;
BEGIN
    -- Get the secret ID and description
    SELECT id, description INTO secret_id, old_description
    FROM vault.decrypted_secrets
    WHERE name = secret_name;
    
    IF secret_id IS NULL THEN
        RAISE EXCEPTION 'Secret % not found', secret_name;
    END IF;
    
    -- Update the secret
    PERFORM vault.update_secret(secret_id, new_value, secret_name, old_description);
END;
$$;


ALTER FUNCTION "public"."update_vault_secret"("secret_name" "text", "new_value" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."update_vault_secret"("secret_name" "text", "new_value" "text") IS 'Update an existing secret in Vault by name.';



CREATE TABLE IF NOT EXISTS "analytics"."events" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "event_type" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "text" NOT NULL,
    "user_id" "uuid",
    "user_role" "text",
    "organization_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "analytics"."events" OWNER TO "postgres";


COMMENT ON TABLE "analytics"."events" IS 'Raw event stream from all domain services';



CREATE TABLE IF NOT EXISTS "analytics"."marketplace_health_daily" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "metric_date" "date" NOT NULL,
    "active_recruiters" integer DEFAULT 0,
    "active_companies" integer DEFAULT 0,
    "active_jobs" integer DEFAULT 0,
    "total_applications" integer DEFAULT 0,
    "total_placements" integer DEFAULT 0,
    "avg_time_to_hire_days" numeric(10,2),
    "hire_rate" numeric(5,2),
    "placement_completion_rate" numeric(5,2),
    "avg_recruiter_response_time_hours" numeric(10,2),
    "total_fees_generated" numeric(12,2) DEFAULT 0,
    "total_payouts_processed" numeric(12,2) DEFAULT 0,
    "fraud_signals_raised" integer DEFAULT 0,
    "disputes_opened" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "analytics"."marketplace_health_daily" OWNER TO "postgres";


COMMENT ON TABLE "analytics"."marketplace_health_daily" IS 'Platform-wide daily health metrics';



CREATE TABLE IF NOT EXISTS "analytics"."metrics_daily" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "metric_type" "text" NOT NULL,
    "time_bucket" "text" DEFAULT 'day'::"text" NOT NULL,
    "time_value" "date" NOT NULL,
    "dimension_user_id" "uuid",
    "dimension_company_id" "uuid",
    "dimension_recruiter_id" "uuid",
    "value" numeric DEFAULT 0 NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "analytics"."metrics_daily" OWNER TO "postgres";


COMMENT ON TABLE "analytics"."metrics_daily" IS 'Daily aggregated metrics';



CREATE TABLE IF NOT EXISTS "analytics"."metrics_hourly" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "metric_type" "text" NOT NULL,
    "time_bucket" "text" DEFAULT 'hour'::"text" NOT NULL,
    "time_value" timestamp with time zone NOT NULL,
    "dimension_user_id" "uuid",
    "dimension_company_id" "uuid",
    "dimension_recruiter_id" "uuid",
    "value" numeric DEFAULT 0 NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "analytics"."metrics_hourly" OWNER TO "postgres";


COMMENT ON TABLE "analytics"."metrics_hourly" IS 'Hourly aggregated metrics';



CREATE TABLE IF NOT EXISTS "analytics"."metrics_monthly" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "metric_type" "text" NOT NULL,
    "time_bucket" "text" DEFAULT 'month'::"text" NOT NULL,
    "time_value" "date" NOT NULL,
    "dimension_user_id" "uuid",
    "dimension_company_id" "uuid",
    "dimension_recruiter_id" "uuid",
    "value" numeric DEFAULT 0 NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "analytics"."metrics_monthly" OWNER TO "postgres";


COMMENT ON TABLE "analytics"."metrics_monthly" IS 'Monthly aggregated metrics for trend analysis';



CREATE TABLE IF NOT EXISTS "public"."ai_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "application_id" "uuid",
    "fit_score" integer,
    "recommendation" character varying,
    "overall_summary" "text",
    "confidence_level" integer,
    "strengths" "text"[] DEFAULT '{}'::"text"[],
    "concerns" "text"[] DEFAULT '{}'::"text"[],
    "matched_skills" "text"[] DEFAULT '{}'::"text"[],
    "missing_skills" "text"[] DEFAULT '{}'::"text"[],
    "skills_match_percentage" integer,
    "required_years" integer,
    "candidate_years" numeric,
    "meets_experience_requirement" boolean,
    "location_compatibility" character varying,
    "model_version" character varying,
    "processing_time_ms" integer,
    "analyzed_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ai_reviews_confidence_level_check" CHECK ((("confidence_level" >= 0) AND ("confidence_level" <= 100))),
    CONSTRAINT "ai_reviews_fit_score_check" CHECK ((("fit_score" >= 0) AND ("fit_score" <= 100))),
    CONSTRAINT "ai_reviews_location_compatibility_check" CHECK ((("location_compatibility")::"text" = ANY (ARRAY[('perfect'::character varying)::"text", ('good'::character varying)::"text", ('challenging'::character varying)::"text", ('mismatch'::character varying)::"text"]))),
    CONSTRAINT "ai_reviews_recommendation_check" CHECK ((("recommendation")::"text" = ANY (ARRAY[('strong_fit'::character varying)::"text", ('good_fit'::character varying)::"text", ('fair_fit'::character varying)::"text", ('poor_fit'::character varying)::"text"]))),
    CONSTRAINT "ai_reviews_skills_match_percentage_check" CHECK ((("skills_match_percentage" >= 0) AND ("skills_match_percentage" <= 100)))
);


ALTER TABLE "public"."ai_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."application_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "application_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "performed_by_user_id" "uuid",
    "performed_by_role" "text",
    "company_id" "uuid",
    "old_value" "jsonb",
    "new_value" "jsonb",
    "metadata" "jsonb",
    "ip_address" "text",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."application_audit_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."application_audit_log" IS 'Audit trail for all actions performed on applications, including acceptance, rejection, and stage changes. 
Provides compliance and security tracking for sensitive candidate data access.';



COMMENT ON COLUMN "public"."application_audit_log"."action" IS 'Type of action: created, accepted, rejected, stage_changed, viewed, etc.';



COMMENT ON COLUMN "public"."application_audit_log"."performed_by_user_id" IS 'User ID from identity service who performed the action';



COMMENT ON COLUMN "public"."application_audit_log"."performed_by_role" IS 'Role of the user who performed the action (company_admin, hiring_manager, recruiter, platform_admin)';



COMMENT ON COLUMN "public"."application_audit_log"."company_id" IS 'Company ID associated with the action (for company-side actions)';



COMMENT ON COLUMN "public"."application_audit_log"."old_value" IS 'Previous state before the action (for updates/changes)';



COMMENT ON COLUMN "public"."application_audit_log"."new_value" IS 'New state after the action (for updates/changes)';



COMMENT ON COLUMN "public"."application_audit_log"."metadata" IS 'Additional context like candidate_id, job_id, recruiter_id, notes, etc.';



COMMENT ON COLUMN "public"."application_audit_log"."ip_address" IS 'IP address of the user who performed the action (for security tracking)';



COMMENT ON COLUMN "public"."application_audit_log"."user_agent" IS 'User agent string of the client (browser/app) that performed the action';



CREATE TABLE IF NOT EXISTS "public"."application_feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "application_id" "uuid" NOT NULL,
    "created_by_user_id" "uuid" NOT NULL,
    "created_by_type" "text" NOT NULL,
    "feedback_type" "text" NOT NULL,
    "message_text" "text" NOT NULL,
    "in_response_to_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "application_feedback_created_by_type_check" CHECK (("created_by_type" = ANY (ARRAY['candidate'::"text", 'candidate_recruiter'::"text", 'platform_admin'::"text"]))),
    CONSTRAINT "application_feedback_feedback_type_check" CHECK (("feedback_type" = ANY (ARRAY['info_request'::"text", 'info_response'::"text", 'note'::"text", 'improvement_request'::"text"])))
);


ALTER TABLE "public"."application_feedback" OWNER TO "postgres";


COMMENT ON TABLE "public"."application_feedback" IS 'Stores communication between candidates, recruiters, and admins during application preparation (pre-submission phase)';



COMMENT ON COLUMN "public"."application_feedback"."feedback_type" IS 'Type of feedback: info_request, info_response, note, or improvement_request';



COMMENT ON COLUMN "public"."application_feedback"."in_response_to_id" IS 'Reference to parent message for threading conversations';



CREATE TABLE IF NOT EXISTS "public"."applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "candidate_id" "uuid",
    "candidate_recruiter_id" "uuid",
    "stage" "text" DEFAULT 'submitted'::"text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "accepted_by_company" boolean DEFAULT false,
    "accepted_at" timestamp with time zone,
    "recruiter_notes" "text",
    "application_source" character varying DEFAULT 'direct'::character varying,
    "ai_reviewed" boolean DEFAULT false,
    "candidate_notes" "text",
    "candidate_name" "text",
    "candidate_email" "text",
    "job_title" "text",
    "company_name" "text",
    "search_vector" "tsvector",
    "internal_notes" "text",
    "cover_letter" "text",
    "salary" integer,
    "submitted_at" timestamp with time zone,
    "hired_at" timestamp with time zone,
    "placement_id" "uuid",
    CONSTRAINT "applications_application_source_check" CHECK ((("application_source")::"text" = ANY (ARRAY[('direct'::character varying)::"text", ('recruiter'::character varying)::"text"]))),
    CONSTRAINT "applications_stage_check" CHECK (("stage" = ANY (ARRAY['draft'::"text", 'ai_review'::"text", 'ai_reviewed'::"text", 'recruiter_request'::"text", 'recruiter_proposed'::"text", 'recruiter_review'::"text", 'screen'::"text", 'submitted'::"text", 'company_review'::"text", 'company_feedback'::"text", 'interview'::"text", 'offer'::"text", 'hired'::"text", 'rejected'::"text", 'withdrawn'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."applications" OWNER TO "postgres";


COMMENT ON COLUMN "public"."applications"."candidate_recruiter_id" IS 'Recruiter representing the candidate (Closer role) - optional';



COMMENT ON COLUMN "public"."applications"."internal_notes" IS 'Internal company notes about the application';



COMMENT ON COLUMN "public"."applications"."cover_letter" IS 'Candidate cover letter for the application';



COMMENT ON COLUMN "public"."applications"."salary" IS 'Candidate requested salary (in dollars)';



COMMENT ON COLUMN "public"."applications"."submitted_at" IS 'When application was submitted to company';



COMMENT ON COLUMN "public"."applications"."hired_at" IS 'When candidate was hired (terminal state)';



COMMENT ON COLUMN "public"."applications"."placement_id" IS 'Reference to placement record when hired';



CREATE TABLE IF NOT EXISTS "public"."automation_executions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "rule_id" "uuid" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "text" NOT NULL,
    "trigger_data" "jsonb",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "executed_at" timestamp with time zone,
    "execution_result" "jsonb",
    "error_message" "text",
    "requires_approval" boolean DEFAULT false,
    "approved_by" "text",
    "approved_at" timestamp with time zone,
    "rejected_by" "text",
    "rejected_at" timestamp with time zone,
    "rejection_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "valid_execution_status" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'executed'::"text", 'failed'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."automation_executions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."automation_rules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "rule_type" "text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "trigger_conditions" "jsonb" NOT NULL,
    "actions" "jsonb" NOT NULL,
    "requires_human_approval" boolean DEFAULT true,
    "max_executions_per_day" integer,
    "times_triggered" integer DEFAULT 0,
    "times_executed" integer DEFAULT 0,
    "last_triggered_at" timestamp with time zone,
    "last_executed_at" timestamp with time zone,
    "created_by" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "valid_rule_status" CHECK (("status" = ANY (ARRAY['active'::"text", 'paused'::"text", 'disabled'::"text"])))
);


ALTER TABLE "public"."automation_rules" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."available_secrets" AS
 SELECT "name",
    "description",
    "created_at",
    "updated_at"
   FROM "vault"."decrypted_secrets"
  WHERE ("name" IS NOT NULL)
  ORDER BY "name";


ALTER VIEW "public"."available_secrets" OWNER TO "postgres";


COMMENT ON VIEW "public"."available_secrets" IS 'List all named secrets with metadata (but not their values).';



CREATE TABLE IF NOT EXISTS "public"."candidate_role_matches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "candidate_id" "uuid" NOT NULL,
    "job_id" "uuid" NOT NULL,
    "match_score" numeric(5,2) NOT NULL,
    "match_reasons" "text"[] NOT NULL,
    "suggested_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "suggested_by" "text" DEFAULT 'system'::"text" NOT NULL,
    "reviewed_by" "text",
    "reviewed_at" timestamp with time zone,
    "accepted" boolean,
    "rejection_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "valid_match_score" CHECK ((("match_score" >= (0)::numeric) AND ("match_score" <= (100)::numeric)))
);


ALTER TABLE "public"."candidate_role_matches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."candidate_sourcers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "candidate_id" "uuid",
    "sourcer_type" "text",
    "sourced_at" timestamp with time zone DEFAULT "now"(),
    "protection_window_days" integer DEFAULT 365,
    "protection_expires_at" timestamp with time zone,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "sourcer_recruiter_id" "uuid" NOT NULL,
    CONSTRAINT "candidate_sourcers_sourcer_type_check" CHECK (("sourcer_type" = ANY (ARRAY['recruiter'::"text", 'tsn'::"text"])))
);


ALTER TABLE "public"."candidate_sourcers" OWNER TO "postgres";


COMMENT ON TABLE "public"."candidate_sourcers" IS 'Permanent attribution of candidate sourcing - first recruiter wins';



COMMENT ON COLUMN "public"."candidate_sourcers"."sourcer_recruiter_id" IS 'Recruiter who first brought this candidate';



CREATE TABLE IF NOT EXISTS "public"."candidates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text",
    "full_name" "text",
    "linkedin_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by_user_id" "uuid",
    "user_id" "uuid",
    "recruiter_id" "uuid",
    "phone" character varying,
    "location" character varying,
    "current_title" character varying,
    "current_company" character varying,
    "verification_status" "text" DEFAULT 'unverified'::"text",
    "verification_metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "verified_at" timestamp with time zone,
    "verified_by_user_id" "uuid",
    "bio" "text",
    "github_url" "text",
    "portfolio_url" "text",
    "skills" "text",
    "search_vector" "tsvector",
    "marketplace_visibility" "text" DEFAULT 'public'::"text",
    "show_email" boolean DEFAULT false,
    "show_phone" boolean DEFAULT false,
    "show_location" boolean DEFAULT true,
    "show_current_company" boolean DEFAULT true,
    "show_salary_expectations" boolean DEFAULT false,
    "desired_salary_min" integer,
    "desired_salary_max" integer,
    "desired_job_type" "text",
    "open_to_remote" boolean DEFAULT true,
    "open_to_relocation" boolean DEFAULT false,
    "availability" "text",
    "marketplace_profile" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "candidates_marketplace_visibility_check" CHECK (("marketplace_visibility" = ANY (ARRAY['public'::"text", 'private'::"text", 'hidden'::"text"]))),
    CONSTRAINT "candidates_verification_status_check" CHECK (("verification_status" = ANY (ARRAY['unverified'::"text", 'pending'::"text", 'verified'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."candidates" OWNER TO "postgres";


COMMENT ON COLUMN "public"."candidates"."search_vector" IS 'Full-text search vector combining full_name (weight A) and email (weight B)';



COMMENT ON COLUMN "public"."candidates"."marketplace_visibility" IS 'Controls candidate visibility to recruiters: public (all), private (connected only), hidden (none)';



COMMENT ON COLUMN "public"."candidates"."show_email" IS 'Allow recruiters to see email address';



COMMENT ON COLUMN "public"."candidates"."show_phone" IS 'Allow recruiters to see phone number';



COMMENT ON COLUMN "public"."candidates"."show_location" IS 'Allow recruiters to see location';



COMMENT ON COLUMN "public"."candidates"."show_current_company" IS 'Allow recruiters to see current employer';



COMMENT ON COLUMN "public"."candidates"."show_salary_expectations" IS 'Allow recruiters to see salary expectations';



COMMENT ON COLUMN "public"."candidates"."desired_salary_min" IS 'Minimum desired annual salary in USD';



COMMENT ON COLUMN "public"."candidates"."desired_salary_max" IS 'Maximum desired annual salary in USD';



COMMENT ON COLUMN "public"."candidates"."desired_job_type" IS 'Preferred job type: full-time, contract, part-time, etc.';



COMMENT ON COLUMN "public"."candidates"."open_to_remote" IS 'Willing to work remotely';



COMMENT ON COLUMN "public"."candidates"."open_to_relocation" IS 'Willing to relocate for position';



COMMENT ON COLUMN "public"."candidates"."availability" IS 'When candidate can start: immediate, 2-weeks, 1-month, 3-months, etc.';



COMMENT ON COLUMN "public"."candidates"."marketplace_profile" IS 'Structured marketplace profile data (bio_rich, achievements, certifications, etc.)';



CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "identity_organization_id" "uuid",
    "name" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "search_vector" "tsvector",
    "website" "text",
    "industry" "text",
    "company_size" "text",
    "headquarters_location" "text",
    "description" "text",
    "logo_url" "text"
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_sourcers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "sourcer_recruiter_id" "uuid" NOT NULL,
    "sourced_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."company_sourcers" OWNER TO "postgres";


COMMENT ON TABLE "public"."company_sourcers" IS 'Permanent attribution of company sourcing - first recruiter wins';



COMMENT ON COLUMN "public"."company_sourcers"."company_id" IS 'Company that was sourced (unique)';



COMMENT ON COLUMN "public"."company_sourcers"."sourcer_recruiter_id" IS 'Recruiter who first brought this company';



COMMENT ON COLUMN "public"."company_sourcers"."sourced_at" IS 'Timestamp when company was first sourced';



CREATE TABLE IF NOT EXISTS "public"."decision_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "decision_type" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "text" NOT NULL,
    "decision_data" "jsonb" NOT NULL,
    "ai_confidence_score" numeric(5,2),
    "ai_reasoning" "text"[],
    "human_override" boolean DEFAULT false,
    "override_reason" "text",
    "created_by" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."decision_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entity_type" "public"."entity_type" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "document_type" "public"."document_type" NOT NULL,
    "filename" character varying NOT NULL,
    "storage_path" "text" NOT NULL,
    "bucket_name" character varying NOT NULL,
    "content_type" character varying NOT NULL,
    "file_size" integer NOT NULL,
    "uploaded_by_user_id" "uuid",
    "processing_status" "public"."processing_status" DEFAULT 'pending'::"public"."processing_status",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    "processing_started_at" timestamp with time zone,
    "processing_completed_at" timestamp with time zone,
    "processing_error" "text"
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."escrow_holds" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "placement_id" "uuid" NOT NULL,
    "payout_id" "uuid",
    "hold_amount" numeric(12,2) NOT NULL,
    "hold_reason" "text" NOT NULL,
    "held_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "release_scheduled_date" "date",
    "released_at" timestamp with time zone,
    "released_by" "text",
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "valid_hold_status" CHECK (("status" = ANY (ARRAY['active'::"text", 'released'::"text", 'forfeited'::"text"])))
);


ALTER TABLE "public"."escrow_holds" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."external_entity_map" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "integration_id" "uuid" NOT NULL,
    "entity_type" "text" NOT NULL,
    "internal_id" "uuid" NOT NULL,
    "external_id" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "external_entity_map_entity_type_check" CHECK (("entity_type" = ANY (ARRAY['role'::"text", 'candidate'::"text", 'application'::"text", 'company'::"text"])))
);


ALTER TABLE "public"."external_entity_map" OWNER TO "postgres";


COMMENT ON TABLE "public"."external_entity_map" IS 'Bidirectional mapping between internal and external entity IDs';



CREATE TABLE IF NOT EXISTS "public"."fraud_signals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "signal_type" "text" NOT NULL,
    "severity" "text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "recruiter_id" "text",
    "job_id" "text",
    "candidate_id" "text",
    "application_id" "text",
    "placement_id" "text",
    "signal_data" "jsonb" NOT NULL,
    "confidence_score" numeric(5,2) NOT NULL,
    "reviewed_by" "text",
    "reviewed_at" timestamp with time zone,
    "resolution_notes" "text",
    "action_taken" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "valid_confidence_score" CHECK ((("confidence_score" >= (0)::numeric) AND ("confidence_score" <= (100)::numeric))),
    CONSTRAINT "valid_severity" CHECK (("severity" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'critical'::"text"]))),
    CONSTRAINT "valid_signal_status" CHECK (("status" = ANY (ARRAY['active'::"text", 'resolved'::"text", 'false_positive'::"text"])))
);


ALTER TABLE "public"."fraud_signals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" character varying,
    "organization_id" "uuid",
    "role" character varying,
    "invited_by" "uuid",
    "clerk_invitation_id" character varying,
    "status" character varying DEFAULT 'pending'::character varying,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '7 days'::interval),
    "accepted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."invitations" OWNER TO "postgres";


COMMENT ON TABLE "public"."invitations" IS 'Pending invitations to join organizations';



COMMENT ON COLUMN "public"."invitations"."clerk_invitation_id" IS 'Reference to Clerk organization invitation';



COMMENT ON COLUMN "public"."invitations"."status" IS 'pending, accepted, expired, revoked';



CREATE TABLE IF NOT EXISTS "public"."job_pre_screen_answers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "application_id" "uuid",
    "question_id" "uuid",
    "answer" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_pre_screen_answers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_pre_screen_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "question" "text",
    "question_type" "text",
    "options" "jsonb",
    "is_required" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "job_pre_screen_questions_question_type_check" CHECK (("question_type" = ANY (ARRAY['text'::"text", 'yes_no'::"text", 'select'::"text", 'multi_select'::"text"])))
);


ALTER TABLE "public"."job_pre_screen_questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_requirements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "requirement_type" "text",
    "description" "text",
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "job_requirements_requirement_type_check" CHECK (("requirement_type" = ANY (ARRAY['mandatory'::"text", 'preferred'::"text"])))
);


ALTER TABLE "public"."job_requirements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid",
    "title" "text",
    "department" "text",
    "location" "text",
    "salary_min" numeric,
    "salary_max" numeric,
    "fee_percentage" numeric,
    "description" "text",
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "recruiter_description" "text",
    "candidate_description" "text",
    "employment_type" "text",
    "open_to_relocation" boolean DEFAULT false,
    "show_salary_range" boolean DEFAULT true,
    "splits_fee_percentage" numeric DEFAULT 50.00,
    "job_owner_id" "uuid",
    "search_vector" "tsvector",
    "company_name" "text",
    "company_industry" "text",
    "company_headquarters_location" "text",
    "job_owner_recruiter_id" "uuid",
    "company_recruiter_id" "uuid",
    CONSTRAINT "jobs_employment_type_check" CHECK (("employment_type" = ANY (ARRAY['full_time'::"text", 'contract'::"text", 'temporary'::"text"]))),
    CONSTRAINT "jobs_fee_percentage_check" CHECK ((("fee_percentage" >= (0)::numeric) AND ("fee_percentage" <= (100)::numeric))),
    CONSTRAINT "jobs_splits_fee_percentage_check" CHECK ((("splits_fee_percentage" >= (0)::numeric) AND ("splits_fee_percentage" <= (100)::numeric))),
    CONSTRAINT "jobs_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'paused'::"text", 'filled'::"text", 'closed'::"text"])))
);


ALTER TABLE "public"."jobs" OWNER TO "postgres";


COMMENT ON COLUMN "public"."jobs"."job_owner_recruiter_id" IS 'Recruiter who created this job posting (Specs Owner role) - only recruiters receive job owner commission';



COMMENT ON COLUMN "public"."jobs"."company_recruiter_id" IS 'Recruiter who represents the company/hiring manager for this job (nullable - direct companies have no recruiter)';



CREATE TABLE IF NOT EXISTS "public"."marketplace_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_type" "text",
    "event_data" "jsonb",
    "user_id" "uuid",
    "recruiter_id" "uuid",
    "job_id" "uuid",
    "candidate_id" "uuid",
    "placement_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."marketplace_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."marketplace_metrics_daily" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "metric_date" "date" NOT NULL,
    "active_recruiters" integer DEFAULT 0,
    "active_companies" integer DEFAULT 0,
    "active_jobs" integer DEFAULT 0,
    "total_applications" integer DEFAULT 0,
    "total_placements" integer DEFAULT 0,
    "avg_time_to_hire_days" numeric(10,2),
    "hire_rate" numeric(5,2),
    "placement_completion_rate" numeric(5,2),
    "avg_recruiter_response_time_hours" numeric(10,2),
    "total_fees_generated" numeric(12,2),
    "total_payouts_processed" numeric(12,2),
    "fraud_signals_raised" integer DEFAULT 0,
    "disputes_opened" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."marketplace_metrics_daily" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."memberships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "organization_id" "uuid",
    "role" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "memberships_role_check" CHECK (("role" = ANY (ARRAY['recruiter'::"text", 'company_admin'::"text", 'hiring_manager'::"text", 'platform_admin'::"text"])))
);


ALTER TABLE "public"."memberships" OWNER TO "postgres";


COMMENT ON TABLE "public"."memberships" IS 'User-organization relationships with roles';



CREATE TABLE IF NOT EXISTS "public"."notification_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_type" "text",
    "recipient_user_id" "uuid",
    "recipient_email" "text",
    "subject" "text",
    "template" "text",
    "payload" "jsonb",
    "sent_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'pending'::"text",
    "error_message" "text",
    "resend_message_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "channel" "text" DEFAULT 'email'::"text",
    "read" boolean DEFAULT false,
    "read_at" timestamp with time zone,
    "dismissed" boolean DEFAULT false,
    "action_url" "text",
    "action_label" "text",
    "priority" "text" DEFAULT 'normal'::"text",
    "category" "text",
    CONSTRAINT "notification_log_channel_check" CHECK (("channel" = ANY (ARRAY['email'::"text", 'in_app'::"text", 'both'::"text"]))),
    CONSTRAINT "notification_log_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'normal'::"text", 'high'::"text", 'urgent'::"text"]))),
    CONSTRAINT "notification_log_status_check" CHECK (("status" = ANY (ARRAY['sent'::"text", 'failed'::"text", 'pending'::"text"])))
);


ALTER TABLE "public"."notification_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text",
    "type" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "organizations_type_check" CHECK (("type" = ANY (ARRAY['company'::"text", 'platform'::"text"])))
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


COMMENT ON TABLE "public"."organizations" IS 'Company and platform organizations';



CREATE TABLE IF NOT EXISTS "public"."payout_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "payout_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "old_status" "text",
    "new_status" "text",
    "old_amount" numeric(12,2),
    "new_amount" numeric(12,2),
    "reason" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "text" NOT NULL,
    "action" character varying(100) DEFAULT 'unknown'::character varying NOT NULL,
    "changed_by" "uuid",
    "changed_by_role" character varying(50)
);


ALTER TABLE "public"."payout_audit_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."payout_audit_log" IS 'Immutable audit trail of all payout changes';



COMMENT ON COLUMN "public"."payout_audit_log"."metadata" IS 'Additional context like Stripe IDs, error details, etc.';



COMMENT ON COLUMN "public"."payout_audit_log"."action" IS 'Action taken: created, approved, processed, failed, cancelled, etc.';



COMMENT ON COLUMN "public"."payout_audit_log"."changed_by" IS 'User who performed the action';



COMMENT ON COLUMN "public"."payout_audit_log"."changed_by_role" IS 'Role of user who performed the action';



CREATE TABLE IF NOT EXISTS "public"."payout_schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "placement_id" "uuid" NOT NULL,
    "scheduled_date" "date" NOT NULL,
    "trigger_event" "text" NOT NULL,
    "status" "text" DEFAULT 'scheduled'::"text" NOT NULL,
    "triggered_at" timestamp with time zone,
    "cancelled_at" timestamp with time zone,
    "cancellation_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "guarantee_completion_date" timestamp with time zone,
    "payout_id" "uuid",
    "processed_at" timestamp with time zone,
    "failure_reason" "text",
    "retry_count" integer DEFAULT 0,
    "last_retry_at" timestamp with time zone,
    CONSTRAINT "valid_schedule_status" CHECK (("status" = ANY (ARRAY['scheduled'::"text", 'triggered'::"text", 'cancelled'::"text", 'pending'::"text", 'processing'::"text", 'processed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."payout_schedules" OWNER TO "postgres";


COMMENT ON COLUMN "public"."payout_schedules"."guarantee_completion_date" IS 'Date when guarantee period completes and payout can be processed';



COMMENT ON COLUMN "public"."payout_schedules"."failure_reason" IS 'Reason for processing failure (for debugging)';



COMMENT ON COLUMN "public"."payout_schedules"."retry_count" IS 'Number of times processing has been attempted';



CREATE TABLE IF NOT EXISTS "public"."payout_splits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "payout_id" "uuid" NOT NULL,
    "collaborator_recruiter_id" "uuid" NOT NULL,
    "split_percentage" numeric(5,2) NOT NULL,
    "split_amount" numeric(12,2) NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "stripe_transfer_id" "text",
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "valid_split_percentage" CHECK ((("split_percentage" > (0)::numeric) AND ("split_percentage" <= (100)::numeric))),
    CONSTRAINT "valid_split_status" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."payout_splits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payouts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "placement_id" "uuid" NOT NULL,
    "recruiter_id" "uuid" NOT NULL,
    "placement_fee" numeric(12,2) NOT NULL,
    "recruiter_share_percentage" numeric(5,2) NOT NULL,
    "payout_amount" numeric(12,2) NOT NULL,
    "stripe_transfer_id" "text",
    "stripe_payout_id" "text",
    "stripe_connect_account_id" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "processing_started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "failed_at" timestamp with time zone,
    "failure_reason" "text",
    "holdback_amount" numeric(12,2) DEFAULT 0,
    "holdback_released_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "text",
    CONSTRAINT "valid_amounts" CHECK ((("payout_amount" >= (0)::numeric) AND ("placement_fee" >= (0)::numeric) AND ("holdback_amount" >= (0)::numeric))),
    CONSTRAINT "valid_percentage" CHECK ((("recruiter_share_percentage" >= (0)::numeric) AND ("recruiter_share_percentage" <= (100)::numeric))),
    CONSTRAINT "valid_status" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'completed'::"text", 'failed'::"text", 'reversed'::"text", 'on_hold'::"text"])))
);


ALTER TABLE "public"."payouts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."placement_payout_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "placement_split_id" "uuid" NOT NULL,
    "placement_id" "uuid" NOT NULL,
    "recruiter_id" "uuid" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "stripe_transfer_id" "text",
    "stripe_payout_id" "text",
    "stripe_connect_account_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "processing_started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "failed_at" timestamp with time zone,
    "failure_reason" "text",
    "retry_count" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "placement_payout_transactions_amount_check" CHECK (("amount" >= (0)::numeric)),
    CONSTRAINT "placement_payout_transactions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'paid'::"text", 'failed'::"text", 'reversed'::"text", 'on_hold'::"text"])))
);


ALTER TABLE "public"."placement_payout_transactions" OWNER TO "postgres";


COMMENT ON TABLE "public"."placement_payout_transactions" IS 'Execution tracking for money movement (Stripe transfers) - one transaction per placement split';



COMMENT ON COLUMN "public"."placement_payout_transactions"."placement_split_id" IS 'References the attribution allocation this transaction pays';



COMMENT ON COLUMN "public"."placement_payout_transactions"."amount" IS 'Amount to pay in USD';



COMMENT ON COLUMN "public"."placement_payout_transactions"."status" IS 'Current state of payment processing';



COMMENT ON COLUMN "public"."placement_payout_transactions"."stripe_transfer_id" IS 'Stripe Transfer ID for this payout';



COMMENT ON COLUMN "public"."placement_payout_transactions"."stripe_payout_id" IS 'Stripe Payout ID (when transfer reaches bank)';



CREATE TABLE IF NOT EXISTS "public"."placement_snapshot" (
    "placement_id" "uuid" NOT NULL,
    "candidate_recruiter_id" "uuid",
    "company_recruiter_id" "uuid",
    "job_owner_recruiter_id" "uuid",
    "candidate_sourcer_recruiter_id" "uuid",
    "company_sourcer_recruiter_id" "uuid",
    "candidate_recruiter_rate" numeric(5,2),
    "company_recruiter_rate" numeric(5,2),
    "job_owner_rate" numeric(5,2),
    "candidate_sourcer_rate" numeric(5,2),
    "company_sourcer_rate" numeric(5,2),
    "total_placement_fee" numeric(10,2) NOT NULL,
    "subscription_tier" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "placement_snapshot_subscription_tier_check" CHECK (("subscription_tier" = ANY (ARRAY['premium'::"text", 'paid'::"text", 'free'::"text"]))),
    CONSTRAINT "valid_candidate_recruiter_rate" CHECK ((("candidate_recruiter_rate" IS NULL) OR (("candidate_recruiter_rate" >= (0)::numeric) AND ("candidate_recruiter_rate" <= (100)::numeric)))),
    CONSTRAINT "valid_candidate_sourcer_rate" CHECK ((("candidate_sourcer_rate" IS NULL) OR (("candidate_sourcer_rate" >= (0)::numeric) AND ("candidate_sourcer_rate" <= (100)::numeric)))),
    CONSTRAINT "valid_company_recruiter_rate" CHECK ((("company_recruiter_rate" IS NULL) OR (("company_recruiter_rate" >= (0)::numeric) AND ("company_recruiter_rate" <= (100)::numeric)))),
    CONSTRAINT "valid_company_sourcer_rate" CHECK ((("company_sourcer_rate" IS NULL) OR (("company_sourcer_rate" >= (0)::numeric) AND ("company_sourcer_rate" <= (100)::numeric)))),
    CONSTRAINT "valid_job_owner_rate" CHECK ((("job_owner_rate" IS NULL) OR (("job_owner_rate" >= (0)::numeric) AND ("job_owner_rate" <= (100)::numeric)))),
    CONSTRAINT "valid_placement_fee" CHECK (("total_placement_fee" > (0)::numeric))
);


ALTER TABLE "public"."placement_snapshot" OWNER TO "postgres";


COMMENT ON TABLE "public"."placement_snapshot" IS 'Immutable money attribution snapshot at hire time';



COMMENT ON COLUMN "public"."placement_snapshot"."placement_id" IS 'Foreign key to placements table (1:1 relationship)';



COMMENT ON COLUMN "public"."placement_snapshot"."candidate_recruiter_id" IS 'Snapshot of candidate recruiter at hire time';



COMMENT ON COLUMN "public"."placement_snapshot"."company_recruiter_id" IS 'Snapshot of company recruiter at hire time';



COMMENT ON COLUMN "public"."placement_snapshot"."job_owner_recruiter_id" IS 'Snapshot of job owner at hire time';



COMMENT ON COLUMN "public"."placement_snapshot"."candidate_sourcer_recruiter_id" IS 'Snapshot of candidate sourcer at hire time';



COMMENT ON COLUMN "public"."placement_snapshot"."company_sourcer_recruiter_id" IS 'Snapshot of company sourcer at hire time';



COMMENT ON COLUMN "public"."placement_snapshot"."total_placement_fee" IS 'Total placement fee at hire time (immutable)';



COMMENT ON COLUMN "public"."placement_snapshot"."subscription_tier" IS 'Subscription tier at hire time';



CREATE TABLE IF NOT EXISTS "public"."placement_splits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "placement_id" "uuid" NOT NULL,
    "team_id" "uuid",
    "recruiter_id" "uuid" NOT NULL,
    "split_percentage" numeric(5,2) NOT NULL,
    "split_amount" numeric(10,2),
    "split_configuration_id" "uuid",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "role" "text" DEFAULT 'candidate_recruiter'::"text" NOT NULL,
    CONSTRAINT "check_role_values" CHECK (("role" = ANY (ARRAY['candidate_recruiter'::"text", 'company_recruiter'::"text", 'job_owner'::"text", 'candidate_sourcer'::"text", 'company_sourcer'::"text"]))),
    CONSTRAINT "placement_splits_split_percentage_check" CHECK ((("split_percentage" >= (0)::numeric) AND ("split_percentage" <= (100)::numeric)))
);


ALTER TABLE "public"."placement_splits" OWNER TO "postgres";


COMMENT ON TABLE "public"."placement_splits" IS 'Individual split distributions for each placement';



CREATE TABLE IF NOT EXISTS "public"."placements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "candidate_id" "uuid",
    "company_id" "uuid",
    "application_id" "uuid",
    "hired_at" timestamp with time zone DEFAULT "now"(),
    "salary" numeric,
    "fee_percentage" numeric,
    "fee_amount" numeric,
    "recruiter_share" numeric,
    "platform_share" numeric,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "state" "text" DEFAULT 'hired'::"text",
    "start_date" "date",
    "end_date" "date",
    "guarantee_days" integer DEFAULT 90,
    "guarantee_expires_at" timestamp with time zone,
    "failure_reason" "text",
    "failed_at" timestamp with time zone,
    "replacement_placement_id" "uuid",
    "candidate_name" "text",
    "candidate_email" "text",
    "job_title" "text",
    "company_name" "text",
    "recruiter_name" "text",
    "recruiter_email" "text",
    "search_vector" "tsvector",
    "candidate_recruiter_id" "uuid",
    "company_recruiter_id" "uuid",
    "job_owner_recruiter_id" "uuid",
    "candidate_sourcer_recruiter_id" "uuid",
    "company_sourcer_recruiter_id" "uuid",
    "placement_fee" numeric,
    CONSTRAINT "placements_placement_fee_check" CHECK (("placement_fee" >= (0)::numeric)),
    CONSTRAINT "placements_state_check" CHECK (("state" = ANY (ARRAY['hired'::"text", 'active'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."placements" OWNER TO "postgres";


COMMENT ON COLUMN "public"."placements"."candidate_recruiter_id" IS 'Recruiter representing the candidate (Closer role)';



COMMENT ON COLUMN "public"."placements"."company_recruiter_id" IS 'Recruiter representing the company (Client/Hiring Facilitator role)';



COMMENT ON COLUMN "public"."placements"."job_owner_recruiter_id" IS 'Recruiter who created the job posting (Specs Owner role)';



COMMENT ON COLUMN "public"."placements"."candidate_sourcer_recruiter_id" IS 'Recruiter who first brought the candidate to platform (Discovery role)';



COMMENT ON COLUMN "public"."placements"."company_sourcer_recruiter_id" IS 'Recruiter who first brought the company to platform (BD role)';



COMMENT ON COLUMN "public"."placements"."placement_fee" IS 'Total placement fee amount in USD';



CREATE TABLE IF NOT EXISTS "public"."plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text",
    "price_monthly" numeric,
    "stripe_price_id" "text",
    "features" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "slug" "text",
    "is_active" boolean DEFAULT true,
    "stripe_product_id" "text"
);


ALTER TABLE "public"."plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recruiter_candidates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "recruiter_id" "uuid",
    "candidate_id" "uuid",
    "relationship_start_date" timestamp with time zone,
    "relationship_end_date" timestamp with time zone,
    "status" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "invited_at" timestamp with time zone DEFAULT "now"(),
    "invitation_token" "text",
    "invitation_expires_at" timestamp with time zone,
    "consent_given" boolean DEFAULT false,
    "consent_given_at" timestamp with time zone,
    "consent_ip_address" "text",
    "consent_user_agent" "text",
    "declined_at" timestamp with time zone,
    "declined_reason" "text",
    "candidate_name" "text",
    "candidate_email" "text",
    "candidate_location" "text",
    "candidate_linkedin_url" "text",
    "search_vector" "tsvector",
    CONSTRAINT "recruiter_candidates_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'expired'::"text", 'terminated'::"text"])))
);


ALTER TABLE "public"."recruiter_candidates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recruiter_reputation" (
    "recruiter_id" "uuid" NOT NULL,
    "total_submissions" integer DEFAULT 0,
    "total_hires" integer DEFAULT 0,
    "hire_rate" numeric,
    "total_placements" integer DEFAULT 0,
    "completed_placements" integer DEFAULT 0,
    "failed_placements" integer DEFAULT 0,
    "completion_rate" numeric,
    "total_collaborations" integer DEFAULT 0,
    "collaboration_rate" numeric,
    "avg_response_time_hours" numeric,
    "proposals_accepted" integer DEFAULT 0,
    "proposals_declined" integer DEFAULT 0,
    "proposals_timed_out" integer DEFAULT 0,
    "reputation_score" numeric DEFAULT 50.0,
    "last_calculated_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "recruiter_reputation_reputation_score_check" CHECK ((("reputation_score" >= (0)::numeric) AND ("reputation_score" <= (100)::numeric)))
);


ALTER TABLE "public"."recruiter_reputation" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recruiters" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text",
    "bio" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "marketplace_enabled" boolean DEFAULT false,
    "marketplace_profile" "jsonb" DEFAULT '{}'::"jsonb",
    "marketplace_visibility" character varying DEFAULT 'public'::character varying,
    "industries" "text"[] DEFAULT ARRAY[]::"text"[],
    "specialties" "text"[] DEFAULT ARRAY[]::"text"[],
    "location" character varying,
    "tagline" character varying,
    "years_experience" integer,
    "show_success_metrics" boolean DEFAULT false,
    "show_contact_info" boolean DEFAULT true,
    "phone" character varying,
    "search_vector" "tsvector",
    "stripe_connect_account_id" "text",
    "stripe_connect_onboarded" boolean DEFAULT false,
    "stripe_connect_onboarded_at" timestamp with time zone,
    CONSTRAINT "recruiters_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'active'::"text", 'suspended'::"text"])))
);


ALTER TABLE "public"."recruiters" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."role_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "recruiter_id" "uuid",
    "assigned_at" timestamp with time zone DEFAULT "now"(),
    "assigned_by" "uuid"
);


ALTER TABLE "public"."role_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."split_configurations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "model" "text" NOT NULL,
    "config" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "split_configurations_model_check" CHECK (("model" = ANY (ARRAY['flat_split'::"text", 'tiered_split'::"text", 'individual_credit'::"text", 'hybrid'::"text"])))
);


ALTER TABLE "public"."split_configurations" OWNER TO "postgres";


COMMENT ON TABLE "public"."split_configurations" IS 'Economic split models for team-based fee distribution';



CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "recruiter_id" "uuid",
    "plan_id" "uuid",
    "stripe_subscription_id" "text",
    "status" "text" DEFAULT 'trialing'::"text",
    "current_period_start" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "cancel_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "stripe_customer_id" "text",
    "user_id" "uuid",
    CONSTRAINT "subscriptions_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'canceled'::"text", 'past_due'::"text", 'trialing'::"text"])))
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sync_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "integration_id" "uuid" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid",
    "external_id" "text",
    "action" "text" NOT NULL,
    "direction" "text" NOT NULL,
    "status" "text" NOT NULL,
    "error_message" "text",
    "error_code" "text",
    "request_payload" "jsonb",
    "response_payload" "jsonb",
    "retry_count" integer DEFAULT 0,
    "synced_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "sync_logs_action_check" CHECK (("action" = ANY (ARRAY['created'::"text", 'updated'::"text", 'deleted'::"text", 'skipped'::"text"]))),
    CONSTRAINT "sync_logs_direction_check" CHECK (("direction" = ANY (ARRAY['inbound'::"text", 'outbound'::"text"]))),
    CONSTRAINT "sync_logs_entity_type_check" CHECK (("entity_type" = ANY (ARRAY['role'::"text", 'candidate'::"text", 'application'::"text", 'stage'::"text", 'interview'::"text"]))),
    CONSTRAINT "sync_logs_status_check" CHECK (("status" = ANY (ARRAY['success'::"text", 'failed'::"text", 'pending'::"text", 'conflict'::"text"])))
);


ALTER TABLE "public"."sync_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."sync_logs" IS 'Audit log of all synchronization operations between ATS and Splits Network';



COMMENT ON COLUMN "public"."sync_logs"."direction" IS 'inbound = ATS → Splits, outbound = Splits → ATS';



CREATE TABLE IF NOT EXISTS "public"."sync_queue" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "integration_id" "uuid" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "direction" "text" NOT NULL,
    "priority" integer DEFAULT 5,
    "payload" "jsonb" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "retry_count" integer DEFAULT 0,
    "max_retries" integer DEFAULT 3,
    "last_error" "text",
    "scheduled_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "processed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "sync_queue_action_check" CHECK (("action" = ANY (ARRAY['create'::"text", 'update'::"text", 'delete'::"text"]))),
    CONSTRAINT "sync_queue_direction_check" CHECK (("direction" = ANY (ARRAY['inbound'::"text", 'outbound'::"text"]))),
    CONSTRAINT "sync_queue_entity_type_check" CHECK (("entity_type" = ANY (ARRAY['role'::"text", 'candidate'::"text", 'application'::"text", 'stage'::"text", 'interview'::"text"]))),
    CONSTRAINT "sync_queue_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."sync_queue" OWNER TO "postgres";


COMMENT ON TABLE "public"."sync_queue" IS 'Async queue for processing sync operations';



COMMENT ON COLUMN "public"."sync_queue"."priority" IS '1 (highest) to 10 (lowest), used for queue ordering';



CREATE TABLE IF NOT EXISTS "public"."team_invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "role" "text" NOT NULL,
    "invited_by" "uuid" NOT NULL,
    "token" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "accepted_at" timestamp with time zone,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "team_invitations_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'member'::"text", 'collaborator'::"text"]))),
    CONSTRAINT "team_invitations_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'expired'::"text", 'revoked'::"text"])))
);


ALTER TABLE "public"."team_invitations" OWNER TO "postgres";


COMMENT ON TABLE "public"."team_invitations" IS 'Pending invitations for recruiters to join teams';



CREATE TABLE IF NOT EXISTS "public"."team_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "recruiter_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    CONSTRAINT "team_members_role_check" CHECK (("role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'member'::"text", 'collaborator'::"text"]))),
    CONSTRAINT "team_members_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'invited'::"text", 'removed'::"text"])))
);


ALTER TABLE "public"."team_members" OWNER TO "postgres";


COMMENT ON TABLE "public"."team_members" IS 'Membership relationships between recruiters and teams';



CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "owner_user_id" "uuid" NOT NULL,
    "billing_organization_id" "uuid",
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "teams_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'suspended'::"text"])))
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


COMMENT ON TABLE "public"."teams" IS 'Recruiting agencies and team accounts that can operate as unified entities';



CREATE TABLE IF NOT EXISTS "public"."user_consent" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "necessary" boolean DEFAULT true,
    "functional" boolean DEFAULT false,
    "analytics" boolean DEFAULT false,
    "marketing" boolean DEFAULT false,
    "ip_address" "inet",
    "user_agent" "text",
    "consent_source" character varying DEFAULT 'web'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_consent" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_consent" IS 'User cookie and privacy consent preferences for GDPR/CCPA compliance';



COMMENT ON COLUMN "public"."user_consent"."necessary" IS 'Always true - required for site functionality';



COMMENT ON COLUMN "public"."user_consent"."functional" IS 'User consent for functional/preference cookies';



COMMENT ON COLUMN "public"."user_consent"."analytics" IS 'User consent for analytics/performance cookies';



COMMENT ON COLUMN "public"."user_consent"."marketing" IS 'User consent for marketing/advertising cookies';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clerk_user_id" "text",
    "email" "text",
    "name" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "onboarding_status" character varying DEFAULT 'pending'::character varying,
    "onboarding_step" integer DEFAULT 1,
    "onboarding_completed_at" timestamp without time zone
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'User accounts and authentication data';



COMMENT ON COLUMN "public"."users"."onboarding_status" IS 'Tracks user onboarding wizard progress: pending, in_progress, completed, skipped';



COMMENT ON COLUMN "public"."users"."onboarding_step" IS 'Current wizard step (1-4): 1=role selection, 2=subscription, 3=profile, 4=complete';



COMMENT ON COLUMN "public"."users"."onboarding_completed_at" IS 'Timestamp when user completed the onboarding wizard';



CREATE TABLE IF NOT EXISTS "public"."webhook_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_type" "text" NOT NULL,
    "event_id" "text" NOT NULL,
    "status" "text" NOT NULL,
    "data" "jsonb",
    "error" "text",
    "processed_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "webhook_logs_status_check" CHECK (("status" = ANY (ARRAY['processing'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."webhook_logs" OWNER TO "postgres";


ALTER TABLE ONLY "analytics"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "analytics"."marketplace_health_daily"
    ADD CONSTRAINT "marketplace_health_daily_metric_date_key" UNIQUE ("metric_date");



ALTER TABLE ONLY "analytics"."marketplace_health_daily"
    ADD CONSTRAINT "marketplace_health_daily_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "analytics"."metrics_daily"
    ADD CONSTRAINT "metrics_daily_metric_type_time_value_dimension_user_id_dime_key" UNIQUE ("metric_type", "time_value", "dimension_user_id", "dimension_company_id", "dimension_recruiter_id");



ALTER TABLE ONLY "analytics"."metrics_daily"
    ADD CONSTRAINT "metrics_daily_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "analytics"."metrics_hourly"
    ADD CONSTRAINT "metrics_hourly_metric_type_time_value_dimension_user_id_dim_key" UNIQUE ("metric_type", "time_value", "dimension_user_id", "dimension_company_id", "dimension_recruiter_id");



ALTER TABLE ONLY "analytics"."metrics_hourly"
    ADD CONSTRAINT "metrics_hourly_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "analytics"."metrics_monthly"
    ADD CONSTRAINT "metrics_monthly_metric_type_time_value_dimension_user_id_di_key" UNIQUE ("metric_type", "time_value", "dimension_user_id", "dimension_company_id", "dimension_recruiter_id");



ALTER TABLE ONLY "analytics"."metrics_monthly"
    ADD CONSTRAINT "metrics_monthly_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_reviews"
    ADD CONSTRAINT "ai_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."application_audit_log"
    ADD CONSTRAINT "application_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."application_feedback"
    ADD CONSTRAINT "application_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."automation_executions"
    ADD CONSTRAINT "automation_executions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."automation_rules"
    ADD CONSTRAINT "automation_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."candidate_role_matches"
    ADD CONSTRAINT "candidate_role_matches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."candidate_sourcers"
    ADD CONSTRAINT "candidate_sourcers_candidate_id_key" UNIQUE ("candidate_id");



ALTER TABLE ONLY "public"."candidate_sourcers"
    ADD CONSTRAINT "candidate_sourcers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."candidates"
    ADD CONSTRAINT "candidates_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."candidates"
    ADD CONSTRAINT "candidates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_sourcers"
    ADD CONSTRAINT "company_sourcers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."decision_audit_log"
    ADD CONSTRAINT "decision_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."escrow_holds"
    ADD CONSTRAINT "escrow_holds_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."external_entity_map"
    ADD CONSTRAINT "external_entity_map_integration_id_entity_type_external_id_key" UNIQUE ("integration_id", "entity_type", "external_id");



ALTER TABLE ONLY "public"."external_entity_map"
    ADD CONSTRAINT "external_entity_map_integration_id_entity_type_internal_id_key" UNIQUE ("integration_id", "entity_type", "internal_id");



ALTER TABLE ONLY "public"."external_entity_map"
    ADD CONSTRAINT "external_entity_map_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fraud_signals"
    ADD CONSTRAINT "fraud_signals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."integrations"
    ADD CONSTRAINT "integrations_company_id_platform_key" UNIQUE ("company_id", "platform");



ALTER TABLE ONLY "public"."integrations"
    ADD CONSTRAINT "integrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_pre_screen_answers"
    ADD CONSTRAINT "job_pre_screen_answers_application_question_unique" UNIQUE ("application_id", "question_id");



ALTER TABLE ONLY "public"."job_pre_screen_answers"
    ADD CONSTRAINT "job_pre_screen_answers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_pre_screen_questions"
    ADD CONSTRAINT "job_pre_screen_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_requirements"
    ADD CONSTRAINT "job_requirements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."marketplace_events"
    ADD CONSTRAINT "marketplace_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."marketplace_metrics_daily"
    ADD CONSTRAINT "marketplace_metrics_daily_metric_date_key" UNIQUE ("metric_date");



ALTER TABLE ONLY "public"."marketplace_metrics_daily"
    ADD CONSTRAINT "marketplace_metrics_daily_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."memberships"
    ADD CONSTRAINT "memberships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_log"
    ADD CONSTRAINT "notification_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payout_audit_log"
    ADD CONSTRAINT "payout_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payout_schedules"
    ADD CONSTRAINT "payout_schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payout_splits"
    ADD CONSTRAINT "payout_splits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payouts"
    ADD CONSTRAINT "payouts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."placement_payout_transactions"
    ADD CONSTRAINT "placement_payout_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."placement_snapshot"
    ADD CONSTRAINT "placement_snapshot_pkey" PRIMARY KEY ("placement_id");



ALTER TABLE ONLY "public"."placement_splits"
    ADD CONSTRAINT "placement_splits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."placements"
    ADD CONSTRAINT "placements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "plans_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."recruiter_candidates"
    ADD CONSTRAINT "recruiter_candidates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recruiter_reputation"
    ADD CONSTRAINT "recruiter_reputation_pkey" PRIMARY KEY ("recruiter_id");



ALTER TABLE ONLY "public"."recruiters"
    ADD CONSTRAINT "recruiters_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recruiters"
    ADD CONSTRAINT "recruiters_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."role_assignments"
    ADD CONSTRAINT "role_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."split_configurations"
    ADD CONSTRAINT "split_configurations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_stripe_subscription_id_key" UNIQUE ("stripe_subscription_id");



ALTER TABLE ONLY "public"."sync_logs"
    ADD CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sync_queue"
    ADD CONSTRAINT "sync_queue_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_invitations"
    ADD CONSTRAINT "team_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_invitations"
    ADD CONSTRAINT "team_invitations_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_recruiter_id_key" UNIQUE ("team_id", "recruiter_id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_sourcers"
    ADD CONSTRAINT "unique_company_sourcer" UNIQUE ("company_id");



ALTER TABLE ONLY "public"."placement_splits"
    ADD CONSTRAINT "unique_placement_recruiter_role" UNIQUE ("placement_id", "recruiter_id", "role");



ALTER TABLE ONLY "public"."placement_payout_transactions"
    ADD CONSTRAINT "unique_split_transaction" UNIQUE ("placement_split_id");



ALTER TABLE ONLY "public"."user_consent"
    ADD CONSTRAINT "user_consent_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_consent"
    ADD CONSTRAINT "user_consent_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_clerk_user_id_key" UNIQUE ("clerk_user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."webhook_logs"
    ADD CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_events_created_at_brin" ON "analytics"."events" USING "brin" ("created_at");



CREATE INDEX "idx_events_entity" ON "analytics"."events" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_events_type" ON "analytics"."events" USING "btree" ("event_type");



CREATE INDEX "idx_events_user" ON "analytics"."events" USING "btree" ("user_id");



CREATE INDEX "idx_marketplace_health_date_brin" ON "analytics"."marketplace_health_daily" USING "brin" ("metric_date");



CREATE INDEX "idx_metrics_daily_company" ON "analytics"."metrics_daily" USING "btree" ("dimension_company_id");



CREATE INDEX "idx_metrics_daily_time_brin" ON "analytics"."metrics_daily" USING "brin" ("time_value");



CREATE INDEX "idx_metrics_daily_type" ON "analytics"."metrics_daily" USING "btree" ("metric_type");



CREATE INDEX "idx_metrics_daily_user" ON "analytics"."metrics_daily" USING "btree" ("dimension_user_id");



CREATE INDEX "idx_metrics_hourly_company" ON "analytics"."metrics_hourly" USING "btree" ("dimension_company_id");



CREATE INDEX "idx_metrics_hourly_time_brin" ON "analytics"."metrics_hourly" USING "brin" ("time_value");



CREATE INDEX "idx_metrics_hourly_type" ON "analytics"."metrics_hourly" USING "btree" ("metric_type");



CREATE INDEX "idx_metrics_hourly_user" ON "analytics"."metrics_hourly" USING "btree" ("dimension_user_id");



CREATE INDEX "idx_metrics_monthly_company" ON "analytics"."metrics_monthly" USING "btree" ("dimension_company_id");



CREATE INDEX "idx_metrics_monthly_time_brin" ON "analytics"."metrics_monthly" USING "brin" ("time_value");



CREATE INDEX "idx_metrics_monthly_type" ON "analytics"."metrics_monthly" USING "btree" ("metric_type");



CREATE INDEX "idx_metrics_monthly_user" ON "analytics"."metrics_monthly" USING "btree" ("dimension_user_id");



CREATE INDEX "applications_candidate_name_trgm_idx" ON "public"."applications" USING "gin" ("candidate_name" "public"."gin_trgm_ops");



CREATE INDEX "applications_job_title_trgm_idx" ON "public"."applications" USING "gin" ("job_title" "public"."gin_trgm_ops");



CREATE INDEX "applications_search_vector_idx" ON "public"."applications" USING "gin" ("search_vector");



CREATE INDEX "candidates_current_company_trgm_idx" ON "public"."candidates" USING "gin" ("current_company" "public"."gin_trgm_ops");



CREATE INDEX "candidates_email_trgm_idx" ON "public"."candidates" USING "gin" ("email" "public"."gin_trgm_ops");



CREATE INDEX "candidates_full_name_trgm_idx" ON "public"."candidates" USING "gin" ("full_name" "public"."gin_trgm_ops");



CREATE INDEX "candidates_search_vector_idx" ON "public"."candidates" USING "gin" ("search_vector");



CREATE INDEX "companies_industry_trgm_idx" ON "public"."companies" USING "gin" ("industry" "public"."gin_trgm_ops");



CREATE INDEX "companies_name_trgm_idx" ON "public"."companies" USING "gin" ("name" "public"."gin_trgm_ops");



CREATE INDEX "companies_search_vector_idx" ON "public"."companies" USING "gin" ("search_vector");



CREATE INDEX "idx_app_feedback_application" ON "public"."application_feedback" USING "btree" ("application_id", "created_at" DESC);



CREATE INDEX "idx_app_feedback_created_by" ON "public"."application_feedback" USING "btree" ("created_by_user_id");



CREATE INDEX "idx_app_feedback_thread" ON "public"."application_feedback" USING "btree" ("in_response_to_id") WHERE ("in_response_to_id" IS NOT NULL);



CREATE INDEX "idx_applications_hired_at" ON "public"."applications" USING "btree" ("hired_at");



CREATE INDEX "idx_applications_placement_id" ON "public"."applications" USING "btree" ("placement_id");



CREATE INDEX "idx_applications_stage" ON "public"."applications" USING "btree" ("stage");



CREATE INDEX "idx_applications_submitted_at" ON "public"."applications" USING "btree" ("submitted_at");



CREATE INDEX "idx_audit_action" ON "public"."payout_audit_log" USING "btree" ("action");



CREATE INDEX "idx_audit_changed_by" ON "public"."payout_audit_log" USING "btree" ("changed_by");



CREATE INDEX "idx_audit_created_at" ON "public"."payout_audit_log" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_audit_event_type" ON "public"."payout_audit_log" USING "btree" ("event_type");



CREATE INDEX "idx_audit_log_action" ON "public"."application_audit_log" USING "btree" ("action");



CREATE INDEX "idx_audit_log_application_id" ON "public"."application_audit_log" USING "btree" ("application_id");



CREATE INDEX "idx_audit_log_company_id" ON "public"."application_audit_log" USING "btree" ("company_id") WHERE ("company_id" IS NOT NULL);



CREATE INDEX "idx_audit_log_created_at" ON "public"."application_audit_log" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_audit_payout" ON "public"."payout_audit_log" USING "btree" ("payout_id");



CREATE INDEX "idx_automation_executions_entity" ON "public"."automation_executions" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_automation_executions_rule" ON "public"."automation_executions" USING "btree" ("rule_id");



CREATE INDEX "idx_automation_executions_status" ON "public"."automation_executions" USING "btree" ("status");



CREATE INDEX "idx_automation_rules_status" ON "public"."automation_rules" USING "btree" ("status") WHERE ("status" = 'active'::"text");



CREATE INDEX "idx_automation_rules_type" ON "public"."automation_rules" USING "btree" ("rule_type");



CREATE INDEX "idx_candidate_matches_candidate" ON "public"."candidate_role_matches" USING "btree" ("candidate_id");



CREATE INDEX "idx_candidate_matches_job" ON "public"."candidate_role_matches" USING "btree" ("job_id");



CREATE INDEX "idx_candidate_matches_reviewed" ON "public"."candidate_role_matches" USING "btree" ("reviewed_at") WHERE ("reviewed_at" IS NULL);



CREATE INDEX "idx_candidate_matches_score" ON "public"."candidate_role_matches" USING "btree" ("match_score" DESC);



CREATE INDEX "idx_candidate_sourcers_recruiter" ON "public"."candidate_sourcers" USING "btree" ("sourcer_recruiter_id");



CREATE INDEX "idx_candidates_search_vector" ON "public"."candidates" USING "gin" ("search_vector");



CREATE INDEX "idx_company_sourcers_company" ON "public"."company_sourcers" USING "btree" ("company_id");



CREATE INDEX "idx_company_sourcers_recruiter" ON "public"."company_sourcers" USING "btree" ("sourcer_recruiter_id");



CREATE INDEX "idx_company_sourcers_sourced_at" ON "public"."company_sourcers" USING "btree" ("sourced_at");



CREATE INDEX "idx_decision_audit_created_at" ON "public"."decision_audit_log" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_decision_audit_entity" ON "public"."decision_audit_log" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_decision_audit_type" ON "public"."decision_audit_log" USING "btree" ("decision_type");



CREATE INDEX "idx_escrow_holds_placement" ON "public"."escrow_holds" USING "btree" ("placement_id");



CREATE INDEX "idx_escrow_holds_release_date" ON "public"."escrow_holds" USING "btree" ("release_scheduled_date") WHERE ("status" = 'active'::"text");



CREATE INDEX "idx_escrow_holds_status" ON "public"."escrow_holds" USING "btree" ("status") WHERE ("status" = 'active'::"text");



CREATE INDEX "idx_external_map_external" ON "public"."external_entity_map" USING "btree" ("entity_type", "external_id");



CREATE INDEX "idx_external_map_integration" ON "public"."external_entity_map" USING "btree" ("integration_id");



CREATE INDEX "idx_external_map_internal" ON "public"."external_entity_map" USING "btree" ("entity_type", "internal_id");



CREATE INDEX "idx_fraud_signals_created_at" ON "public"."fraud_signals" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_fraud_signals_recruiter" ON "public"."fraud_signals" USING "btree" ("recruiter_id");



CREATE INDEX "idx_fraud_signals_severity" ON "public"."fraud_signals" USING "btree" ("severity");



CREATE INDEX "idx_fraud_signals_status" ON "public"."fraud_signals" USING "btree" ("status") WHERE ("status" = 'active'::"text");



CREATE INDEX "idx_integrations_company" ON "public"."integrations" USING "btree" ("company_id");



CREATE INDEX "idx_integrations_platform" ON "public"."integrations" USING "btree" ("platform");



CREATE INDEX "idx_integrations_sync_enabled" ON "public"."integrations" USING "btree" ("sync_enabled") WHERE ("sync_enabled" = true);



CREATE INDEX "idx_job_pre_screen_answers_application" ON "public"."job_pre_screen_answers" USING "btree" ("application_id");



CREATE INDEX "idx_job_pre_screen_answers_question" ON "public"."job_pre_screen_answers" USING "btree" ("question_id");



CREATE INDEX "idx_jobs_company_recruiter_id" ON "public"."jobs" USING "btree" ("company_recruiter_id");



CREATE INDEX "idx_jobs_owner_recruiter" ON "public"."jobs" USING "btree" ("job_owner_recruiter_id") WHERE ("job_owner_recruiter_id" IS NOT NULL);



CREATE INDEX "idx_marketplace_metrics_date" ON "public"."marketplace_metrics_daily" USING "btree" ("metric_date" DESC);



CREATE INDEX "idx_payout_audit_created_at" ON "public"."payout_audit_log" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_payout_audit_payout" ON "public"."payout_audit_log" USING "btree" ("payout_id");



CREATE INDEX "idx_payout_schedules_automation" ON "public"."payout_schedules" USING "btree" ("status", "scheduled_date") WHERE ("status" = ANY (ARRAY['scheduled'::"text", 'pending'::"text"]));



COMMENT ON INDEX "public"."idx_payout_schedules_automation" IS 'Optimizes automated processing queries';



CREATE INDEX "idx_payout_schedules_date" ON "public"."payout_schedules" USING "btree" ("scheduled_date") WHERE ("status" = 'scheduled'::"text");



CREATE INDEX "idx_payout_schedules_guarantee_completion" ON "public"."payout_schedules" USING "btree" ("guarantee_completion_date") WHERE ("guarantee_completion_date" IS NOT NULL);



COMMENT ON INDEX "public"."idx_payout_schedules_guarantee_completion" IS 'Optimizes guarantee period tracking queries';



CREATE INDEX "idx_payout_schedules_guarantee_date" ON "public"."payout_schedules" USING "btree" ("guarantee_completion_date");



CREATE INDEX "idx_payout_schedules_payout" ON "public"."payout_schedules" USING "btree" ("payout_id");



CREATE INDEX "idx_payout_schedules_placement" ON "public"."payout_schedules" USING "btree" ("placement_id");



COMMENT ON INDEX "public"."idx_payout_schedules_placement" IS 'Optimizes placement-to-schedule lookups';



CREATE INDEX "idx_payout_schedules_processed_at" ON "public"."payout_schedules" USING "btree" ("processed_at") WHERE ("processed_at" IS NOT NULL);



COMMENT ON INDEX "public"."idx_payout_schedules_processed_at" IS 'Optimizes reporting on processed schedules';



CREATE INDEX "idx_payout_schedules_scheduled_date" ON "public"."payout_schedules" USING "btree" ("scheduled_date");



COMMENT ON INDEX "public"."idx_payout_schedules_scheduled_date" IS 'Optimizes date-based schedule queries';



CREATE INDEX "idx_payout_schedules_status" ON "public"."payout_schedules" USING "btree" ("status");



COMMENT ON INDEX "public"."idx_payout_schedules_status" IS 'Optimizes queries filtering by schedule status';



CREATE INDEX "idx_payout_splits_payout" ON "public"."payout_splits" USING "btree" ("payout_id");



CREATE INDEX "idx_payout_splits_recruiter" ON "public"."payout_splits" USING "btree" ("collaborator_recruiter_id");



CREATE INDEX "idx_payout_transactions_created_at" ON "public"."placement_payout_transactions" USING "btree" ("created_at");



CREATE INDEX "idx_payout_transactions_placement" ON "public"."placement_payout_transactions" USING "btree" ("placement_id");



CREATE INDEX "idx_payout_transactions_recruiter" ON "public"."placement_payout_transactions" USING "btree" ("recruiter_id");



CREATE INDEX "idx_payout_transactions_status" ON "public"."placement_payout_transactions" USING "btree" ("status");



CREATE INDEX "idx_payout_transactions_stripe_transfer" ON "public"."placement_payout_transactions" USING "btree" ("stripe_transfer_id") WHERE ("stripe_transfer_id" IS NOT NULL);



CREATE INDEX "idx_payouts_created_at" ON "public"."payouts" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_payouts_placement" ON "public"."payouts" USING "btree" ("placement_id");



CREATE INDEX "idx_payouts_recruiter" ON "public"."payouts" USING "btree" ("recruiter_id");



CREATE INDEX "idx_payouts_status" ON "public"."payouts" USING "btree" ("status");



CREATE INDEX "idx_placement_snapshot_candidate_recruiter" ON "public"."placement_snapshot" USING "btree" ("candidate_recruiter_id") WHERE ("candidate_recruiter_id" IS NOT NULL);



CREATE INDEX "idx_placement_snapshot_candidate_sourcer" ON "public"."placement_snapshot" USING "btree" ("candidate_sourcer_recruiter_id") WHERE ("candidate_sourcer_recruiter_id" IS NOT NULL);



CREATE INDEX "idx_placement_snapshot_company_recruiter" ON "public"."placement_snapshot" USING "btree" ("company_recruiter_id") WHERE ("company_recruiter_id" IS NOT NULL);



CREATE INDEX "idx_placement_snapshot_company_sourcer" ON "public"."placement_snapshot" USING "btree" ("company_sourcer_recruiter_id") WHERE ("company_sourcer_recruiter_id" IS NOT NULL);



CREATE INDEX "idx_placement_snapshot_created_at" ON "public"."placement_snapshot" USING "btree" ("created_at");



CREATE INDEX "idx_placement_snapshot_job_owner" ON "public"."placement_snapshot" USING "btree" ("job_owner_recruiter_id") WHERE ("job_owner_recruiter_id" IS NOT NULL);



CREATE INDEX "idx_placement_snapshot_tier" ON "public"."placement_snapshot" USING "btree" ("subscription_tier");



CREATE INDEX "idx_placement_splits_placement" ON "public"."placement_splits" USING "btree" ("placement_id");



CREATE INDEX "idx_placement_splits_placement_role" ON "public"."placement_splits" USING "btree" ("placement_id", "role");



CREATE INDEX "idx_placement_splits_recruiter" ON "public"."placement_splits" USING "btree" ("recruiter_id");



CREATE INDEX "idx_placement_splits_role" ON "public"."placement_splits" USING "btree" ("role");



CREATE INDEX "idx_placement_splits_team" ON "public"."placement_splits" USING "btree" ("team_id");



CREATE INDEX "idx_placements_candidate_recruiter_id" ON "public"."placements" USING "btree" ("candidate_recruiter_id");



CREATE INDEX "idx_placements_candidate_sourcer_recruiter_id" ON "public"."placements" USING "btree" ("candidate_sourcer_recruiter_id");



CREATE INDEX "idx_placements_company_recruiter_id" ON "public"."placements" USING "btree" ("company_recruiter_id");



CREATE INDEX "idx_placements_company_sourcer_recruiter_id" ON "public"."placements" USING "btree" ("company_sourcer_recruiter_id");



CREATE INDEX "idx_placements_job_owner_recruiter_id" ON "public"."placements" USING "btree" ("job_owner_recruiter_id");



CREATE INDEX "idx_recruiters_stripe_account" ON "public"."recruiters" USING "btree" ("stripe_connect_account_id") WHERE ("stripe_connect_account_id" IS NOT NULL);



CREATE INDEX "idx_split_configs_default" ON "public"."split_configurations" USING "btree" ("team_id", "is_default") WHERE ("is_default" = true);



CREATE INDEX "idx_split_configs_team" ON "public"."split_configurations" USING "btree" ("team_id");



CREATE INDEX "idx_subscriptions_stripe_customer" ON "public"."subscriptions" USING "btree" ("stripe_customer_id");



CREATE INDEX "idx_subscriptions_stripe_subscription" ON "public"."subscriptions" USING "btree" ("stripe_subscription_id");



CREATE INDEX "idx_subscriptions_user_id" ON "public"."subscriptions" USING "btree" ("user_id");



CREATE INDEX "idx_sync_logs_entity" ON "public"."sync_logs" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_sync_logs_external" ON "public"."sync_logs" USING "btree" ("external_id");



CREATE INDEX "idx_sync_logs_integration" ON "public"."sync_logs" USING "btree" ("integration_id");



CREATE INDEX "idx_sync_logs_status" ON "public"."sync_logs" USING "btree" ("status");



CREATE INDEX "idx_sync_logs_synced_at" ON "public"."sync_logs" USING "btree" ("synced_at" DESC);



CREATE INDEX "idx_sync_queue_integration" ON "public"."sync_queue" USING "btree" ("integration_id");



CREATE INDEX "idx_sync_queue_priority" ON "public"."sync_queue" USING "btree" ("priority", "scheduled_at") WHERE ("status" = 'pending'::"text");



CREATE INDEX "idx_sync_queue_scheduled" ON "public"."sync_queue" USING "btree" ("scheduled_at") WHERE ("status" = 'pending'::"text");



CREATE INDEX "idx_sync_queue_status" ON "public"."sync_queue" USING "btree" ("status") WHERE ("status" = ANY (ARRAY['pending'::"text", 'processing'::"text"]));



CREATE INDEX "idx_team_invitations_email" ON "public"."team_invitations" USING "btree" ("email");



CREATE INDEX "idx_team_invitations_team" ON "public"."team_invitations" USING "btree" ("team_id");



CREATE INDEX "idx_team_invitations_token" ON "public"."team_invitations" USING "btree" ("token");



CREATE INDEX "idx_team_members_recruiter" ON "public"."team_members" USING "btree" ("recruiter_id");



CREATE INDEX "idx_team_members_status" ON "public"."team_members" USING "btree" ("status");



CREATE INDEX "idx_team_members_team" ON "public"."team_members" USING "btree" ("team_id");



CREATE INDEX "idx_teams_owner" ON "public"."teams" USING "btree" ("owner_user_id");



CREATE INDEX "idx_teams_status" ON "public"."teams" USING "btree" ("status");



CREATE INDEX "idx_webhook_logs_event_id_status" ON "public"."webhook_logs" USING "btree" ("event_id", "status");



CREATE INDEX "idx_webhook_logs_event_type" ON "public"."webhook_logs" USING "btree" ("event_type");



CREATE INDEX "idx_webhook_logs_processed_at" ON "public"."webhook_logs" USING "btree" ("processed_at" DESC);



CREATE INDEX "jobs_company_name_trgm_idx" ON "public"."jobs" USING "gin" ("company_name" "public"."gin_trgm_ops");



CREATE INDEX "jobs_description_trgm_idx" ON "public"."jobs" USING "gin" ("description" "public"."gin_trgm_ops");



CREATE INDEX "jobs_search_vector_idx" ON "public"."jobs" USING "gin" ("search_vector");



CREATE INDEX "jobs_title_trgm_idx" ON "public"."jobs" USING "gin" ("title" "public"."gin_trgm_ops");



CREATE INDEX "placements_candidate_name_trgm_idx" ON "public"."placements" USING "gin" ("candidate_name" "public"."gin_trgm_ops");



CREATE INDEX "placements_company_name_trgm_idx" ON "public"."placements" USING "gin" ("company_name" "public"."gin_trgm_ops");



CREATE INDEX "placements_job_title_trgm_idx" ON "public"."placements" USING "gin" ("job_title" "public"."gin_trgm_ops");



CREATE INDEX "placements_search_vector_idx" ON "public"."placements" USING "gin" ("search_vector");



CREATE INDEX "recruiter_candidates_candidate_email_idx" ON "public"."recruiter_candidates" USING "gin" ("candidate_email" "public"."gin_trgm_ops");



CREATE INDEX "recruiter_candidates_candidate_email_trgm_idx" ON "public"."recruiter_candidates" USING "gin" ("candidate_email" "public"."gin_trgm_ops");



CREATE INDEX "recruiter_candidates_candidate_name_idx" ON "public"."recruiter_candidates" USING "gin" ("candidate_name" "public"."gin_trgm_ops");



CREATE INDEX "recruiter_candidates_candidate_name_trgm_idx" ON "public"."recruiter_candidates" USING "gin" ("candidate_name" "public"."gin_trgm_ops");



CREATE INDEX "recruiter_candidates_search_vector_idx" ON "public"."recruiter_candidates" USING "gin" ("search_vector");



CREATE INDEX "recruiters_search_vector_idx" ON "public"."recruiters" USING "gin" ("search_vector");



CREATE OR REPLACE TRIGGER "sync_applications_candidate_data" AFTER UPDATE OF "full_name", "email" ON "public"."candidates" FOR EACH ROW EXECUTE FUNCTION "public"."sync_applications_candidate_data"();



CREATE OR REPLACE TRIGGER "sync_applications_job_data" AFTER UPDATE OF "title", "company_name" ON "public"."jobs" FOR EACH ROW EXECUTE FUNCTION "public"."sync_applications_job_data"();



CREATE OR REPLACE TRIGGER "sync_jobs_company_data" AFTER INSERT OR UPDATE OF "name", "industry", "headquarters_location" ON "public"."companies" FOR EACH ROW EXECUTE FUNCTION "public"."sync_jobs_company_data"();



CREATE OR REPLACE TRIGGER "sync_placements_candidate_data_trigger" AFTER UPDATE ON "public"."candidates" FOR EACH ROW WHEN ((("old"."full_name" IS DISTINCT FROM "new"."full_name") OR ("old"."email" IS DISTINCT FROM "new"."email"))) EXECUTE FUNCTION "public"."sync_placements_candidate_data"();



CREATE OR REPLACE TRIGGER "sync_placements_company_data_trigger" AFTER UPDATE ON "public"."companies" FOR EACH ROW WHEN (("old"."name" IS DISTINCT FROM "new"."name")) EXECUTE FUNCTION "public"."sync_placements_company_data"();



CREATE OR REPLACE TRIGGER "sync_placements_job_data_trigger" AFTER UPDATE ON "public"."jobs" FOR EACH ROW WHEN ((("old"."title" IS DISTINCT FROM "new"."title") OR ("old"."company_id" IS DISTINCT FROM "new"."company_id"))) EXECUTE FUNCTION "public"."sync_placements_job_data"();



CREATE OR REPLACE TRIGGER "sync_placements_recruiter_data_trigger" AFTER UPDATE ON "public"."users" FOR EACH ROW WHEN ((("old"."name" IS DISTINCT FROM "new"."name") OR ("old"."email" IS DISTINCT FROM "new"."email"))) EXECUTE FUNCTION "public"."sync_placements_recruiter_data"();



CREATE OR REPLACE TRIGGER "sync_recruiter_candidate_search" AFTER INSERT OR UPDATE OF "full_name", "email", "location", "linkedin_url" ON "public"."candidates" FOR EACH ROW EXECUTE FUNCTION "public"."sync_recruiter_candidate_search_fields"();



CREATE OR REPLACE TRIGGER "sync_recruiter_user_search_vector" AFTER INSERT OR UPDATE OF "name", "email" ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."sync_recruiter_user_search_vector"();



CREATE OR REPLACE TRIGGER "trigger_update_placement_payout_transaction_updated_at" BEFORE UPDATE ON "public"."placement_payout_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_placement_payout_transaction_updated_at"();



CREATE OR REPLACE TRIGGER "update_application_feedback_updated_at" BEFORE UPDATE ON "public"."application_feedback" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_applications_search_vector_trigger" BEFORE INSERT OR UPDATE ON "public"."applications" FOR EACH ROW EXECUTE FUNCTION "public"."update_applications_search_vector"();



CREATE OR REPLACE TRIGGER "update_candidates_search_vector_trigger" BEFORE INSERT OR UPDATE ON "public"."candidates" FOR EACH ROW EXECUTE FUNCTION "public"."update_candidates_search_vector"();



CREATE OR REPLACE TRIGGER "update_companies_search_vector_trigger" BEFORE INSERT OR UPDATE ON "public"."companies" FOR EACH ROW EXECUTE FUNCTION "public"."update_companies_search_vector"();



CREATE OR REPLACE TRIGGER "update_external_entity_map_updated_at" BEFORE UPDATE ON "public"."external_entity_map" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_integrations_updated_at" BEFORE UPDATE ON "public"."integrations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_job_search_on_requirements_change" AFTER INSERT OR DELETE OR UPDATE ON "public"."job_requirements" FOR EACH ROW EXECUTE FUNCTION "public"."update_job_search_on_requirements_change"();



CREATE OR REPLACE TRIGGER "update_jobs_search_vector_trigger" BEFORE INSERT OR UPDATE ON "public"."jobs" FOR EACH ROW EXECUTE FUNCTION "public"."update_jobs_search_vector"();



CREATE OR REPLACE TRIGGER "update_placements_search_vector_trigger" BEFORE INSERT OR UPDATE ON "public"."placements" FOR EACH ROW EXECUTE FUNCTION "public"."update_placements_search_vector"();



CREATE OR REPLACE TRIGGER "update_recruiters_search_vector_trigger" BEFORE INSERT OR UPDATE ON "public"."recruiters" FOR EACH ROW EXECUTE FUNCTION "public"."update_recruiters_search_vector"();



CREATE OR REPLACE TRIGGER "update_search_vector_trigger" BEFORE INSERT OR UPDATE ON "public"."recruiter_candidates" FOR EACH ROW EXECUTE FUNCTION "public"."update_recruiter_candidate_search_vector"();



CREATE OR REPLACE TRIGGER "update_split_configurations_updated_at" BEFORE UPDATE ON "public"."split_configurations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_teams_updated_at" BEFORE UPDATE ON "public"."teams" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."ai_reviews"
    ADD CONSTRAINT "ai_reviews_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id");



ALTER TABLE ONLY "public"."application_audit_log"
    ADD CONSTRAINT "application_audit_log_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."application_feedback"
    ADD CONSTRAINT "application_feedback_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."application_feedback"
    ADD CONSTRAINT "application_feedback_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."application_feedback"
    ADD CONSTRAINT "application_feedback_in_response_to_id_fkey" FOREIGN KEY ("in_response_to_id") REFERENCES "public"."application_feedback"("id");



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id");



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id");



ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_recruiter_id_fkey" FOREIGN KEY ("candidate_recruiter_id") REFERENCES "public"."recruiters"("id");



ALTER TABLE ONLY "public"."automation_executions"
    ADD CONSTRAINT "automation_executions_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "public"."automation_rules"("id");



ALTER TABLE ONLY "public"."candidate_sourcers"
    ADD CONSTRAINT "candidate_sourcers_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id");



ALTER TABLE ONLY "public"."candidate_sourcers"
    ADD CONSTRAINT "candidate_sourcers_sourcer_recruiter_id_fkey" FOREIGN KEY ("sourcer_recruiter_id") REFERENCES "public"."recruiters"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."candidates"
    ADD CONSTRAINT "candidates_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."candidates"
    ADD CONSTRAINT "candidates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."candidates"
    ADD CONSTRAINT "candidates_verified_by_user_id_fkey" FOREIGN KEY ("verified_by_user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_identity_organization_id_fkey" FOREIGN KEY ("identity_organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."company_sourcers"
    ADD CONSTRAINT "company_sourcers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_sourcers"
    ADD CONSTRAINT "company_sourcers_sourcer_recruiter_id_fkey" FOREIGN KEY ("sourcer_recruiter_id") REFERENCES "public"."recruiters"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."escrow_holds"
    ADD CONSTRAINT "escrow_holds_payout_id_fkey" FOREIGN KEY ("payout_id") REFERENCES "public"."payouts"("id");



ALTER TABLE ONLY "public"."escrow_holds"
    ADD CONSTRAINT "escrow_holds_placement_id_fkey" FOREIGN KEY ("placement_id") REFERENCES "public"."placements"("id");



ALTER TABLE ONLY "public"."external_entity_map"
    ADD CONSTRAINT "external_entity_map_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "fk_jobs_company_recruiter_id" FOREIGN KEY ("company_recruiter_id") REFERENCES "public"."recruiters"("id");



ALTER TABLE ONLY "public"."integrations"
    ADD CONSTRAINT "integrations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."job_pre_screen_answers"
    ADD CONSTRAINT "job_pre_screen_answers_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id");



ALTER TABLE ONLY "public"."job_pre_screen_answers"
    ADD CONSTRAINT "job_pre_screen_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."job_pre_screen_questions"("id");



ALTER TABLE ONLY "public"."job_pre_screen_questions"
    ADD CONSTRAINT "job_pre_screen_questions_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id");



ALTER TABLE ONLY "public"."job_requirements"
    ADD CONSTRAINT "job_requirements_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_job_owner_recruiter_id_fkey" FOREIGN KEY ("job_owner_recruiter_id") REFERENCES "public"."recruiters"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."marketplace_events"
    ADD CONSTRAINT "marketplace_events_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id");



ALTER TABLE ONLY "public"."marketplace_events"
    ADD CONSTRAINT "marketplace_events_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id");



ALTER TABLE ONLY "public"."marketplace_events"
    ADD CONSTRAINT "marketplace_events_placement_id_fkey" FOREIGN KEY ("placement_id") REFERENCES "public"."placements"("id");



ALTER TABLE ONLY "public"."marketplace_events"
    ADD CONSTRAINT "marketplace_events_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "public"."recruiters"("id");



ALTER TABLE ONLY "public"."marketplace_events"
    ADD CONSTRAINT "marketplace_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."memberships"
    ADD CONSTRAINT "memberships_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."memberships"
    ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."notification_log"
    ADD CONSTRAINT "notification_log_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."payout_audit_log"
    ADD CONSTRAINT "payout_audit_log_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."payout_audit_log"
    ADD CONSTRAINT "payout_audit_log_payout_id_fkey" FOREIGN KEY ("payout_id") REFERENCES "public"."payouts"("id");



ALTER TABLE ONLY "public"."payout_schedules"
    ADD CONSTRAINT "payout_schedules_payout_id_fkey" FOREIGN KEY ("payout_id") REFERENCES "public"."payouts"("id");



ALTER TABLE ONLY "public"."payout_schedules"
    ADD CONSTRAINT "payout_schedules_placement_id_fkey" FOREIGN KEY ("placement_id") REFERENCES "public"."placements"("id");



ALTER TABLE ONLY "public"."payout_splits"
    ADD CONSTRAINT "payout_splits_collaborator_recruiter_id_fkey" FOREIGN KEY ("collaborator_recruiter_id") REFERENCES "public"."recruiters"("id");



ALTER TABLE ONLY "public"."payout_splits"
    ADD CONSTRAINT "payout_splits_payout_id_fkey" FOREIGN KEY ("payout_id") REFERENCES "public"."payouts"("id");



ALTER TABLE ONLY "public"."payouts"
    ADD CONSTRAINT "payouts_placement_id_fkey" FOREIGN KEY ("placement_id") REFERENCES "public"."placements"("id");



ALTER TABLE ONLY "public"."payouts"
    ADD CONSTRAINT "payouts_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "public"."recruiters"("id");



ALTER TABLE ONLY "public"."placement_payout_transactions"
    ADD CONSTRAINT "placement_payout_transactions_placement_id_fkey" FOREIGN KEY ("placement_id") REFERENCES "public"."placements"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."placement_payout_transactions"
    ADD CONSTRAINT "placement_payout_transactions_placement_split_id_fkey" FOREIGN KEY ("placement_split_id") REFERENCES "public"."placement_splits"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."placement_payout_transactions"
    ADD CONSTRAINT "placement_payout_transactions_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "public"."recruiters"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."placement_splits"
    ADD CONSTRAINT "placement_splits_placement_id_fkey" FOREIGN KEY ("placement_id") REFERENCES "public"."placements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."placement_splits"
    ADD CONSTRAINT "placement_splits_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "public"."recruiters"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."placement_splits"
    ADD CONSTRAINT "placement_splits_split_configuration_id_fkey" FOREIGN KEY ("split_configuration_id") REFERENCES "public"."split_configurations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."placement_splits"
    ADD CONSTRAINT "placement_splits_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."placements"
    ADD CONSTRAINT "placements_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id");



ALTER TABLE ONLY "public"."placements"
    ADD CONSTRAINT "placements_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id");



ALTER TABLE ONLY "public"."placements"
    ADD CONSTRAINT "placements_candidate_recruiter_id_fkey" FOREIGN KEY ("candidate_recruiter_id") REFERENCES "public"."recruiters"("id");



ALTER TABLE ONLY "public"."placements"
    ADD CONSTRAINT "placements_candidate_sourcer_recruiter_id_fkey" FOREIGN KEY ("candidate_sourcer_recruiter_id") REFERENCES "public"."recruiters"("id");



ALTER TABLE ONLY "public"."placements"
    ADD CONSTRAINT "placements_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."placements"
    ADD CONSTRAINT "placements_company_recruiter_id_fkey" FOREIGN KEY ("company_recruiter_id") REFERENCES "public"."recruiters"("id");



ALTER TABLE ONLY "public"."placements"
    ADD CONSTRAINT "placements_company_sourcer_recruiter_id_fkey" FOREIGN KEY ("company_sourcer_recruiter_id") REFERENCES "public"."recruiters"("id");



ALTER TABLE ONLY "public"."placements"
    ADD CONSTRAINT "placements_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id");



ALTER TABLE ONLY "public"."placements"
    ADD CONSTRAINT "placements_job_owner_recruiter_id_fkey" FOREIGN KEY ("job_owner_recruiter_id") REFERENCES "public"."recruiters"("id");



ALTER TABLE ONLY "public"."placements"
    ADD CONSTRAINT "placements_replacement_placement_id_fkey" FOREIGN KEY ("replacement_placement_id") REFERENCES "public"."placements"("id");



ALTER TABLE ONLY "public"."recruiter_candidates"
    ADD CONSTRAINT "recruiter_candidates_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."recruiter_candidates"
    ADD CONSTRAINT "recruiter_candidates_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "public"."recruiters"("id");



ALTER TABLE ONLY "public"."recruiter_reputation"
    ADD CONSTRAINT "recruiter_reputation_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "public"."recruiters"("id");



ALTER TABLE ONLY "public"."recruiters"
    ADD CONSTRAINT "recruiters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."role_assignments"
    ADD CONSTRAINT "role_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."role_assignments"
    ADD CONSTRAINT "role_assignments_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id");



ALTER TABLE ONLY "public"."role_assignments"
    ADD CONSTRAINT "role_assignments_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "public"."recruiters"("id");



ALTER TABLE ONLY "public"."split_configurations"
    ADD CONSTRAINT "split_configurations_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "public"."recruiters"("id");



ALTER TABLE ONLY "public"."sync_logs"
    ADD CONSTRAINT "sync_logs_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sync_queue"
    ADD CONSTRAINT "sync_queue_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_invitations"
    ADD CONSTRAINT "team_invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_invitations"
    ADD CONSTRAINT "team_invitations_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "public"."recruiters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_billing_organization_id_fkey" FOREIGN KEY ("billing_organization_id") REFERENCES "public"."organizations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."user_consent"
    ADD CONSTRAINT "user_consent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE "public"."application_feedback" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "application_feedback_admin_create" ON "public"."application_feedback" FOR INSERT WITH CHECK ((("created_by_type" = 'platform_admin'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."memberships" "m"
  WHERE (("m"."user_id" = "auth"."uid"()) AND ("m"."role" = 'platform_admin'::"text"))))));



CREATE POLICY "application_feedback_admin_view" ON "public"."application_feedback" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."memberships" "m"
  WHERE (("m"."user_id" = "auth"."uid"()) AND ("m"."role" = 'platform_admin'::"text")))));



CREATE POLICY "application_feedback_candidate_create" ON "public"."application_feedback" FOR INSERT WITH CHECK ((("created_by_type" = 'candidate'::"text") AND (EXISTS ( SELECT 1
   FROM ("public"."applications" "a"
     JOIN "public"."candidates" "c" ON (("a"."candidate_id" = "c"."id")))
  WHERE (("a"."id" = "application_feedback"."application_id") AND ("c"."user_id" = "auth"."uid"()))))));



CREATE POLICY "application_feedback_candidate_view" ON "public"."application_feedback" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."applications" "a"
     JOIN "public"."candidates" "c" ON (("a"."candidate_id" = "c"."id")))
  WHERE (("a"."id" = "application_feedback"."application_id") AND ("c"."user_id" = "auth"."uid"())))));



CREATE POLICY "application_feedback_recruiter_create" ON "public"."application_feedback" FOR INSERT WITH CHECK ((("created_by_type" = 'candidate_recruiter'::"text") AND (EXISTS ( SELECT 1
   FROM ((("public"."applications" "a"
     JOIN "public"."candidates" "c" ON (("a"."candidate_id" = "c"."id")))
     JOIN "public"."recruiter_candidates" "rc" ON (("c"."id" = "rc"."candidate_id")))
     JOIN "public"."recruiters" "r" ON (("rc"."recruiter_id" = "r"."id")))
  WHERE (("a"."id" = "application_feedback"."application_id") AND ("r"."user_id" = "auth"."uid"()) AND ("rc"."status" = 'active'::"text"))))));



CREATE POLICY "application_feedback_recruiter_view" ON "public"."application_feedback" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ((("public"."applications" "a"
     JOIN "public"."candidates" "c" ON (("a"."candidate_id" = "c"."id")))
     JOIN "public"."recruiter_candidates" "rc" ON (("c"."id" = "rc"."candidate_id")))
     JOIN "public"."recruiters" "r" ON (("rc"."recruiter_id" = "r"."id")))
  WHERE (("a"."id" = "application_feedback"."application_id") AND ("r"."user_id" = "auth"."uid"()) AND ("rc"."status" = 'active'::"text")))));



ALTER TABLE "public"."company_sourcers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "company_sourcers_admin_all" ON "public"."company_sourcers" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."users" "u"
     JOIN "public"."memberships" "m" ON (("m"."user_id" = "u"."id")))
  WHERE (("u"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")) AND ("m"."role" = 'platform_admin'::"text")))));



CREATE POLICY "company_sourcers_company_own" ON "public"."company_sourcers" FOR SELECT TO "authenticated" USING (("company_id" IN ( SELECT "m"."organization_id"
   FROM ("public"."users" "u"
     JOIN "public"."memberships" "m" ON (("m"."user_id" = "u"."id")))
  WHERE ("u"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")))));



CREATE POLICY "company_sourcers_recruiter_own" ON "public"."company_sourcers" FOR SELECT TO "authenticated" USING (("sourcer_recruiter_id" IN ( SELECT "r"."id"
   FROM ("public"."recruiters" "r"
     JOIN "public"."users" "u" ON (("u"."id" = "r"."user_id")))
  WHERE ("u"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")))));



ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."external_entity_map" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "external_map_policy" ON "public"."external_entity_map" USING (("integration_id" IN ( SELECT "i"."id"
   FROM ((("public"."integrations" "i"
     JOIN "public"."companies" "c" ON (("c"."id" = "i"."company_id")))
     JOIN "public"."organizations" "o" ON (("o"."id" = "c"."identity_organization_id")))
     JOIN "public"."memberships" "m" ON (("m"."organization_id" = "o"."id")))
  WHERE ("m"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."integrations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "integrations_company_policy" ON "public"."integrations" USING (("company_id" IN ( SELECT "o"."id"
   FROM ("public"."organizations" "o"
     JOIN "public"."memberships" "m" ON (("m"."organization_id" = "o"."id")))
  WHERE (("m"."user_id" = "auth"."uid"()) AND ("m"."role" = ANY (ARRAY['admin'::"text", 'owner'::"text"]))))));



ALTER TABLE "public"."placement_snapshot" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "placement_snapshot_admin_all" ON "public"."placement_snapshot" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."users" "u"
     JOIN "public"."memberships" "m" ON (("m"."user_id" = "u"."id")))
  WHERE (("u"."clerk_user_id" = ("auth"."jwt"() ->> 'sub'::"text")) AND ("m"."role" = 'platform_admin'::"text")))));



ALTER TABLE "public"."placement_splits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."split_configurations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sync_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "sync_logs_insert_policy" ON "public"."sync_logs" FOR INSERT WITH CHECK (true);



CREATE POLICY "sync_logs_view_policy" ON "public"."sync_logs" FOR SELECT USING (("integration_id" IN ( SELECT "i"."id"
   FROM ((("public"."integrations" "i"
     JOIN "public"."companies" "c" ON (("c"."id" = "i"."company_id")))
     JOIN "public"."organizations" "o" ON (("o"."id" = "c"."identity_organization_id")))
     JOIN "public"."memberships" "m" ON (("m"."organization_id" = "o"."id")))
  WHERE ("m"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."sync_queue" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "sync_queue_policy" ON "public"."sync_queue" USING (true);



ALTER TABLE "public"."team_invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "team_members_modify_policy" ON "public"."team_members" USING (("team_id" IN ( SELECT "tm"."team_id"
   FROM ("public"."team_members" "tm"
     JOIN "public"."recruiters" "r" ON (("r"."id" = "tm"."recruiter_id")))
  WHERE (("r"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"text") AND ("tm"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



CREATE POLICY "team_members_select_policy" ON "public"."team_members" FOR SELECT USING (("team_id" IN ( SELECT "tm"."team_id"
   FROM ("public"."team_members" "tm"
     JOIN "public"."recruiters" "r" ON (("r"."id" = "tm"."recruiter_id")))
  WHERE (("r"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"text")))));



ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "teams_insert_policy" ON "public"."teams" FOR INSERT WITH CHECK (("owner_user_id" = "auth"."uid"()));



CREATE POLICY "teams_select_policy" ON "public"."teams" FOR SELECT USING ((("owner_user_id" = "auth"."uid"()) OR ("id" IN ( SELECT "tm"."team_id"
   FROM ("public"."team_members" "tm"
     JOIN "public"."recruiters" "r" ON (("r"."id" = "tm"."recruiter_id")))
  WHERE (("r"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"text"))))));



CREATE POLICY "teams_update_policy" ON "public"."teams" FOR UPDATE USING (("owner_user_id" = "auth"."uid"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "analytics" TO "service_role";
GRANT USAGE ON SCHEMA "analytics" TO "anon";
GRANT USAGE ON SCHEMA "analytics" TO "authenticated";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";



GRANT ALL ON FUNCTION "analytics"."get_chart_metrics"("p_metric_types" "text"[], "p_start_date" "date", "p_end_date" "date", "p_recruiter_id" "uuid", "p_company_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "analytics"."get_chart_metrics"("p_metric_types" "text"[], "p_start_date" "date", "p_end_date" "date", "p_recruiter_id" "uuid", "p_company_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "analytics"."get_chart_metrics"("p_metric_types" "text"[], "p_start_date" "date", "p_end_date" "date", "p_recruiter_id" "uuid", "p_company_id" "uuid") TO "authenticated";

























































































































































GRANT ALL ON FUNCTION "public"."build_applications_search_vector"("p_candidate_name" "text", "p_candidate_email" "text", "p_job_title" "text", "p_company_name" "text", "p_notes" "text", "p_stage" "text", "p_recruiter_notes" "text", "p_candidate_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."build_applications_search_vector"("p_candidate_name" "text", "p_candidate_email" "text", "p_job_title" "text", "p_company_name" "text", "p_notes" "text", "p_stage" "text", "p_recruiter_notes" "text", "p_candidate_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."build_applications_search_vector"("p_candidate_name" "text", "p_candidate_email" "text", "p_job_title" "text", "p_company_name" "text", "p_notes" "text", "p_stage" "text", "p_recruiter_notes" "text", "p_candidate_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."build_candidates_search_vector"("p_full_name" "text", "p_email" "text", "p_current_title" "text", "p_current_company" "text", "p_skills" "text", "p_bio" "text", "p_location" "text", "p_phone" "text", "p_desired_job_type" "text", "p_linkedin_url" "text", "p_github_url" "text", "p_portfolio_url" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."build_candidates_search_vector"("p_full_name" "text", "p_email" "text", "p_current_title" "text", "p_current_company" "text", "p_skills" "text", "p_bio" "text", "p_location" "text", "p_phone" "text", "p_desired_job_type" "text", "p_linkedin_url" "text", "p_github_url" "text", "p_portfolio_url" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."build_candidates_search_vector"("p_full_name" "text", "p_email" "text", "p_current_title" "text", "p_current_company" "text", "p_skills" "text", "p_bio" "text", "p_location" "text", "p_phone" "text", "p_desired_job_type" "text", "p_linkedin_url" "text", "p_github_url" "text", "p_portfolio_url" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."build_companies_search_vector"("p_name" "text", "p_description" "text", "p_industry" "text", "p_headquarters_location" "text", "p_company_size" "text", "p_website" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."build_companies_search_vector"("p_name" "text", "p_description" "text", "p_industry" "text", "p_headquarters_location" "text", "p_company_size" "text", "p_website" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."build_companies_search_vector"("p_name" "text", "p_description" "text", "p_industry" "text", "p_headquarters_location" "text", "p_company_size" "text", "p_website" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."build_jobs_search_vector"("p_title" "text", "p_description" "text", "p_recruiter_description" "text", "p_candidate_description" "text", "p_location" "text", "p_company_name" "text", "p_company_industry" "text", "p_company_headquarters_location" "text", "p_employment_type" "text", "p_department" "text", "p_status" "text", "p_requirements_text" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."build_jobs_search_vector"("p_title" "text", "p_description" "text", "p_recruiter_description" "text", "p_candidate_description" "text", "p_location" "text", "p_company_name" "text", "p_company_industry" "text", "p_company_headquarters_location" "text", "p_employment_type" "text", "p_department" "text", "p_status" "text", "p_requirements_text" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."build_jobs_search_vector"("p_title" "text", "p_description" "text", "p_recruiter_description" "text", "p_candidate_description" "text", "p_location" "text", "p_company_name" "text", "p_company_industry" "text", "p_company_headquarters_location" "text", "p_employment_type" "text", "p_department" "text", "p_status" "text", "p_requirements_text" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."build_jobs_search_vector"("p_job_id" "uuid", "p_title" "text", "p_description" "text", "p_recruiter_description" "text", "p_candidate_description" "text", "p_location" "text", "p_department" "text", "p_employment_type" "text", "p_company_name" "text", "p_company_industry" "text", "p_company_headquarters_location" "text", "p_status" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."build_jobs_search_vector"("p_job_id" "uuid", "p_title" "text", "p_description" "text", "p_recruiter_description" "text", "p_candidate_description" "text", "p_location" "text", "p_department" "text", "p_employment_type" "text", "p_company_name" "text", "p_company_industry" "text", "p_company_headquarters_location" "text", "p_status" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."build_jobs_search_vector"("p_job_id" "uuid", "p_title" "text", "p_description" "text", "p_recruiter_description" "text", "p_candidate_description" "text", "p_location" "text", "p_department" "text", "p_employment_type" "text", "p_company_name" "text", "p_company_industry" "text", "p_company_headquarters_location" "text", "p_status" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."build_placements_search_vector"("p_candidate_name" "text", "p_candidate_email" "text", "p_job_title" "text", "p_company_name" "text", "p_recruiter_name" "text", "p_recruiter_email" "text", "p_state" "text", "p_salary" numeric, "p_failure_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."build_placements_search_vector"("p_candidate_name" "text", "p_candidate_email" "text", "p_job_title" "text", "p_company_name" "text", "p_recruiter_name" "text", "p_recruiter_email" "text", "p_state" "text", "p_salary" numeric, "p_failure_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."build_placements_search_vector"("p_candidate_name" "text", "p_candidate_email" "text", "p_job_title" "text", "p_company_name" "text", "p_recruiter_name" "text", "p_recruiter_email" "text", "p_state" "text", "p_salary" numeric, "p_failure_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."build_recruiter_candidate_search_vector"("p_candidate_name" "text", "p_candidate_email" "text", "p_candidate_location" "text", "p_status" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."build_recruiter_candidate_search_vector"("p_candidate_name" "text", "p_candidate_email" "text", "p_candidate_location" "text", "p_status" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."build_recruiter_candidate_search_vector"("p_candidate_name" "text", "p_candidate_email" "text", "p_candidate_location" "text", "p_status" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."build_recruiters_search_vector"("p_recruiter_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."build_recruiters_search_vector"("p_recruiter_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."build_recruiters_search_vector"("p_recruiter_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."candidate_matches_search"("candidate_id" "uuid", "search_term" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."candidate_matches_search"("candidate_id" "uuid", "search_term" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."candidate_matches_search"("candidate_id" "uuid", "search_term" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_vault_secret"("secret_value" "text", "secret_name" "text", "secret_description" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_vault_secret"("secret_value" "text", "secret_name" "text", "secret_description" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_vault_secret"("secret_value" "text", "secret_name" "text", "secret_description" "text") TO "service_role";



GRANT ALL ON TABLE "public"."integrations" TO "anon";
GRANT ALL ON TABLE "public"."integrations" TO "authenticated";
GRANT ALL ON TABLE "public"."integrations" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_integration_by_company_platform"("p_company_id" "uuid", "p_platform" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_integration_by_company_platform"("p_company_id" "uuid", "p_platform" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_integration_by_company_platform"("p_company_id" "uuid", "p_platform" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_secret"("secret_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_secret"("secret_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_secret"("secret_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."map_external_to_internal"("p_integration_id" "uuid", "p_entity_type" "text", "p_external_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."map_external_to_internal"("p_integration_id" "uuid", "p_entity_type" "text", "p_external_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."map_external_to_internal"("p_integration_id" "uuid", "p_entity_type" "text", "p_external_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."map_internal_to_external"("p_integration_id" "uuid", "p_entity_type" "text", "p_internal_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."map_internal_to_external"("p_integration_id" "uuid", "p_entity_type" "text", "p_internal_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."map_internal_to_external"("p_integration_id" "uuid", "p_entity_type" "text", "p_internal_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";



GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_applications_candidate_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_applications_candidate_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_applications_candidate_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_applications_job_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_applications_job_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_applications_job_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_jobs_company_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_jobs_company_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_jobs_company_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_placements_candidate_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_placements_candidate_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_placements_candidate_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_placements_company_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_placements_company_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_placements_company_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_placements_job_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_placements_job_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_placements_job_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_placements_recruiter_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_placements_recruiter_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_placements_recruiter_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_recruiter_candidate_search_fields"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_recruiter_candidate_search_fields"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_recruiter_candidate_search_fields"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_recruiter_user_search_vector"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_recruiter_user_search_vector"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_recruiter_user_search_vector"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_applications_search_vector"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_applications_search_vector"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_applications_search_vector"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_candidates_search_vector"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_candidates_search_vector"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_candidates_search_vector"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_companies_search_vector"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_companies_search_vector"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_companies_search_vector"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_job_search_on_requirements_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_job_search_on_requirements_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_job_search_on_requirements_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_jobs_search_vector"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_jobs_search_vector"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_jobs_search_vector"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_placement_payout_transaction_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_placement_payout_transaction_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_placement_payout_transaction_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_placements_search_vector"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_placements_search_vector"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_placements_search_vector"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_recruiter_candidate_search_vector"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_recruiter_candidate_search_vector"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_recruiter_candidate_search_vector"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_recruiters_search_vector"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_recruiters_search_vector"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_recruiters_search_vector"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_vault_secret"("secret_name" "text", "new_value" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_vault_secret"("secret_name" "text", "new_value" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_vault_secret"("secret_name" "text", "new_value" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";












GRANT SELECT ON TABLE "analytics"."events" TO "service_role";
GRANT SELECT ON TABLE "analytics"."events" TO "anon";
GRANT SELECT ON TABLE "analytics"."events" TO "authenticated";



GRANT SELECT ON TABLE "analytics"."marketplace_health_daily" TO "service_role";
GRANT SELECT ON TABLE "analytics"."marketplace_health_daily" TO "anon";
GRANT SELECT ON TABLE "analytics"."marketplace_health_daily" TO "authenticated";



GRANT SELECT ON TABLE "analytics"."metrics_daily" TO "service_role";
GRANT SELECT ON TABLE "analytics"."metrics_daily" TO "anon";
GRANT SELECT ON TABLE "analytics"."metrics_daily" TO "authenticated";



GRANT SELECT ON TABLE "analytics"."metrics_hourly" TO "service_role";
GRANT SELECT ON TABLE "analytics"."metrics_hourly" TO "anon";
GRANT SELECT ON TABLE "analytics"."metrics_hourly" TO "authenticated";



GRANT SELECT ON TABLE "analytics"."metrics_monthly" TO "service_role";
GRANT SELECT ON TABLE "analytics"."metrics_monthly" TO "anon";
GRANT SELECT ON TABLE "analytics"."metrics_monthly" TO "authenticated";









GRANT ALL ON TABLE "public"."ai_reviews" TO "anon";
GRANT ALL ON TABLE "public"."ai_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."application_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."application_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."application_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."application_feedback" TO "anon";
GRANT ALL ON TABLE "public"."application_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."application_feedback" TO "service_role";



GRANT ALL ON TABLE "public"."applications" TO "anon";
GRANT ALL ON TABLE "public"."applications" TO "authenticated";
GRANT ALL ON TABLE "public"."applications" TO "service_role";



GRANT ALL ON TABLE "public"."automation_executions" TO "anon";
GRANT ALL ON TABLE "public"."automation_executions" TO "authenticated";
GRANT ALL ON TABLE "public"."automation_executions" TO "service_role";



GRANT ALL ON TABLE "public"."automation_rules" TO "anon";
GRANT ALL ON TABLE "public"."automation_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."automation_rules" TO "service_role";









GRANT ALL ON TABLE "public"."available_secrets" TO "anon";
GRANT ALL ON TABLE "public"."available_secrets" TO "authenticated";
GRANT ALL ON TABLE "public"."available_secrets" TO "service_role";



GRANT ALL ON TABLE "public"."candidate_role_matches" TO "anon";
GRANT ALL ON TABLE "public"."candidate_role_matches" TO "authenticated";
GRANT ALL ON TABLE "public"."candidate_role_matches" TO "service_role";



GRANT ALL ON TABLE "public"."candidate_sourcers" TO "anon";
GRANT ALL ON TABLE "public"."candidate_sourcers" TO "authenticated";
GRANT ALL ON TABLE "public"."candidate_sourcers" TO "service_role";



GRANT ALL ON TABLE "public"."candidates" TO "anon";
GRANT ALL ON TABLE "public"."candidates" TO "authenticated";
GRANT ALL ON TABLE "public"."candidates" TO "service_role";



GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";



GRANT ALL ON TABLE "public"."company_sourcers" TO "anon";
GRANT ALL ON TABLE "public"."company_sourcers" TO "authenticated";
GRANT ALL ON TABLE "public"."company_sourcers" TO "service_role";



GRANT ALL ON TABLE "public"."decision_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."decision_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."decision_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."escrow_holds" TO "anon";
GRANT ALL ON TABLE "public"."escrow_holds" TO "authenticated";
GRANT ALL ON TABLE "public"."escrow_holds" TO "service_role";



GRANT ALL ON TABLE "public"."external_entity_map" TO "anon";
GRANT ALL ON TABLE "public"."external_entity_map" TO "authenticated";
GRANT ALL ON TABLE "public"."external_entity_map" TO "service_role";



GRANT ALL ON TABLE "public"."fraud_signals" TO "anon";
GRANT ALL ON TABLE "public"."fraud_signals" TO "authenticated";
GRANT ALL ON TABLE "public"."fraud_signals" TO "service_role";



GRANT ALL ON TABLE "public"."invitations" TO "anon";
GRANT ALL ON TABLE "public"."invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."invitations" TO "service_role";



GRANT ALL ON TABLE "public"."job_pre_screen_answers" TO "anon";
GRANT ALL ON TABLE "public"."job_pre_screen_answers" TO "authenticated";
GRANT ALL ON TABLE "public"."job_pre_screen_answers" TO "service_role";



GRANT ALL ON TABLE "public"."job_pre_screen_questions" TO "anon";
GRANT ALL ON TABLE "public"."job_pre_screen_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."job_pre_screen_questions" TO "service_role";



GRANT ALL ON TABLE "public"."job_requirements" TO "anon";
GRANT ALL ON TABLE "public"."job_requirements" TO "authenticated";
GRANT ALL ON TABLE "public"."job_requirements" TO "service_role";



GRANT ALL ON TABLE "public"."jobs" TO "anon";
GRANT ALL ON TABLE "public"."jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."jobs" TO "service_role";



GRANT ALL ON TABLE "public"."marketplace_events" TO "anon";
GRANT ALL ON TABLE "public"."marketplace_events" TO "authenticated";
GRANT ALL ON TABLE "public"."marketplace_events" TO "service_role";



GRANT ALL ON TABLE "public"."marketplace_metrics_daily" TO "anon";
GRANT ALL ON TABLE "public"."marketplace_metrics_daily" TO "authenticated";
GRANT ALL ON TABLE "public"."marketplace_metrics_daily" TO "service_role";



GRANT ALL ON TABLE "public"."memberships" TO "anon";
GRANT ALL ON TABLE "public"."memberships" TO "authenticated";
GRANT ALL ON TABLE "public"."memberships" TO "service_role";



GRANT ALL ON TABLE "public"."notification_log" TO "anon";
GRANT ALL ON TABLE "public"."notification_log" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_log" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."payout_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."payout_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."payout_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."payout_schedules" TO "anon";
GRANT ALL ON TABLE "public"."payout_schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."payout_schedules" TO "service_role";



GRANT ALL ON TABLE "public"."payout_splits" TO "anon";
GRANT ALL ON TABLE "public"."payout_splits" TO "authenticated";
GRANT ALL ON TABLE "public"."payout_splits" TO "service_role";



GRANT ALL ON TABLE "public"."payouts" TO "anon";
GRANT ALL ON TABLE "public"."payouts" TO "authenticated";
GRANT ALL ON TABLE "public"."payouts" TO "service_role";



GRANT ALL ON TABLE "public"."placement_payout_transactions" TO "anon";
GRANT ALL ON TABLE "public"."placement_payout_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."placement_payout_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."placement_snapshot" TO "anon";
GRANT ALL ON TABLE "public"."placement_snapshot" TO "authenticated";
GRANT ALL ON TABLE "public"."placement_snapshot" TO "service_role";



GRANT ALL ON TABLE "public"."placement_splits" TO "anon";
GRANT ALL ON TABLE "public"."placement_splits" TO "authenticated";
GRANT ALL ON TABLE "public"."placement_splits" TO "service_role";



GRANT ALL ON TABLE "public"."placements" TO "anon";
GRANT ALL ON TABLE "public"."placements" TO "authenticated";
GRANT ALL ON TABLE "public"."placements" TO "service_role";



GRANT ALL ON TABLE "public"."plans" TO "anon";
GRANT ALL ON TABLE "public"."plans" TO "authenticated";
GRANT ALL ON TABLE "public"."plans" TO "service_role";



GRANT ALL ON TABLE "public"."recruiter_candidates" TO "anon";
GRANT ALL ON TABLE "public"."recruiter_candidates" TO "authenticated";
GRANT ALL ON TABLE "public"."recruiter_candidates" TO "service_role";



GRANT ALL ON TABLE "public"."recruiter_reputation" TO "anon";
GRANT ALL ON TABLE "public"."recruiter_reputation" TO "authenticated";
GRANT ALL ON TABLE "public"."recruiter_reputation" TO "service_role";



GRANT ALL ON TABLE "public"."recruiters" TO "anon";
GRANT ALL ON TABLE "public"."recruiters" TO "authenticated";
GRANT ALL ON TABLE "public"."recruiters" TO "service_role";



GRANT ALL ON TABLE "public"."role_assignments" TO "anon";
GRANT ALL ON TABLE "public"."role_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."role_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."split_configurations" TO "anon";
GRANT ALL ON TABLE "public"."split_configurations" TO "authenticated";
GRANT ALL ON TABLE "public"."split_configurations" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."sync_logs" TO "anon";
GRANT ALL ON TABLE "public"."sync_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."sync_logs" TO "service_role";



GRANT ALL ON TABLE "public"."sync_queue" TO "anon";
GRANT ALL ON TABLE "public"."sync_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."sync_queue" TO "service_role";



GRANT ALL ON TABLE "public"."team_invitations" TO "anon";
GRANT ALL ON TABLE "public"."team_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."team_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."team_members" TO "anon";
GRANT ALL ON TABLE "public"."team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."team_members" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";



GRANT ALL ON TABLE "public"."user_consent" TO "anon";
GRANT ALL ON TABLE "public"."user_consent" TO "authenticated";
GRANT ALL ON TABLE "public"."user_consent" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."webhook_logs" TO "anon";
GRANT ALL ON TABLE "public"."webhook_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."webhook_logs" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "analytics" GRANT SELECT ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "analytics" GRANT SELECT ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "analytics" GRANT SELECT ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "analytics" GRANT SELECT ON TABLES TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































