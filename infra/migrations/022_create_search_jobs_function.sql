-- Migration: Create search_jobs_with_company and count_jobs_with_company functions
-- These functions provide fast server-side search and counting with status filtering

CREATE OR REPLACE FUNCTION ats.search_jobs_with_company(
    search_terms TEXT[] DEFAULT NULL,
    filter_status TEXT DEFAULT NULL,
    filter_location TEXT DEFAULT NULL,
    filter_employment_type TEXT DEFAULT NULL,
    result_limit INT DEFAULT 50,
    result_offset INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    company_id UUID,
    title TEXT,
    department TEXT,
    location TEXT,
    salary_min NUMERIC,
    salary_max NUMERIC,
    fee_percentage NUMERIC,
    description TEXT,
    recruiter_description TEXT,
    candidate_description TEXT,
    employment_type TEXT,
    open_to_relocation BOOLEAN,
    show_salary_range BOOLEAN,
    splits_fee_percentage NUMERIC,
    job_owner_id UUID,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    company_name TEXT,
    company_identity_organization_id TEXT,
    company_created_at TIMESTAMPTZ,
    company_updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id,
        j.company_id,
        j.title,
        j.department,
        j.location,
        j.salary_min,
        j.salary_max,
        j.fee_percentage,
        j.description,
        j.recruiter_description,
        j.candidate_description,
        j.employment_type,
        j.open_to_relocation,
        j.show_salary_range,
        j.splits_fee_percentage,
        j.job_owner_id,
        j.status,
        j.created_at,
        j.updated_at,
        c.name as company_name,
        c.identity_organization_id as company_identity_organization_id,
        c.created_at as company_created_at,
        c.updated_at as company_updated_at
    FROM ats.jobs j
    INNER JOIN ats.companies c ON j.company_id = c.id
    WHERE
        -- Status filter (CRITICAL: must filter by status)
        (filter_status IS NULL OR j.status = filter_status)
        -- Location filter
        AND (filter_location IS NULL OR j.location ILIKE '%' || filter_location || '%')
        -- Employment type filter
        AND (filter_employment_type IS NULL OR j.employment_type = filter_employment_type)
        -- Search filter: Match if ANY term matches ANY field (OR logic)
        AND (
            search_terms IS NULL 
            OR EXISTS (
                SELECT 1 
                FROM unnest(search_terms) AS term
                WHERE 
                    j.title ILIKE '%' || term || '%'
                    OR j.description ILIKE '%' || term || '%'
                    OR j.recruiter_description ILIKE '%' || term || '%'
                    OR j.location ILIKE '%' || term || '%'
                    OR c.name ILIKE '%' || term || '%'
            )
        )
    ORDER BY j.created_at DESC
    LIMIT result_limit
    OFFSET result_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Count function for pagination
CREATE OR REPLACE FUNCTION ats.count_jobs_with_company(
    search_terms TEXT[] DEFAULT NULL,
    filter_status TEXT DEFAULT NULL,
    filter_location TEXT DEFAULT NULL,
    filter_employment_type TEXT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
    total_count BIGINT;
BEGIN
    SELECT COUNT(*)
    INTO total_count
    FROM ats.jobs j
    INNER JOIN ats.companies c ON j.company_id = c.id
    WHERE
        -- Status filter (CRITICAL: must filter by status)
        (filter_status IS NULL OR j.status = filter_status)
        -- Location filter
        AND (filter_location IS NULL OR j.location ILIKE '%' || filter_location || '%')
        -- Employment type filter
        AND (filter_employment_type IS NULL OR j.employment_type = filter_employment_type)
        -- Search filter: Match if ANY term matches ANY field (OR logic)
        AND (
            search_terms IS NULL 
            OR EXISTS (
                SELECT 1 
                FROM unnest(search_terms) AS term
                WHERE 
                    j.title ILIKE '%' || term || '%'
                    OR j.description ILIKE '%' || term || '%'
                    OR j.recruiter_description ILIKE '%' || term || '%'
                    OR j.location ILIKE '%' || term || '%'
                    OR c.name ILIKE '%' || term || '%'
            )
        );
    
    RETURN total_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant permissions
GRANT EXECUTE ON FUNCTION ats.search_jobs_with_company TO authenticated;
GRANT EXECUTE ON FUNCTION ats.count_jobs_with_company TO authenticated;
