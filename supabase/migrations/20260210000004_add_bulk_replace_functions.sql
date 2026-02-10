-- Migration: Add bulk replace functions for job requirements and pre-screen questions
-- This addresses performance issues by allowing atomic bulk operations instead of multiple DELETEs/INSERTs

-- =====================================================================================
-- Function: bulk_replace_job_requirements
-- Purpose: Atomically replace all requirements for a job with new ones
-- =====================================================================================
CREATE OR REPLACE FUNCTION bulk_replace_job_requirements(
    p_job_id UUID,
    p_requirements JSONB
)
RETURNS SETOF job_requirements AS $$
DECLARE
    req_item JSONB;
    new_requirement job_requirements;
BEGIN
    -- Delete all existing requirements for this job
    DELETE FROM job_requirements WHERE job_id = p_job_id;
    
    -- Insert new requirements from JSONB array
    FOR req_item IN SELECT jsonb_array_elements(p_requirements)
    LOOP
        INSERT INTO job_requirements (
            job_id,
            requirement_type,
            description,
            sort_order,
            created_at,
            updated_at
        )
        VALUES (
            p_job_id,
            req_item->>'requirement_type',
            req_item->>'description',
            (req_item->>'sort_order')::INTEGER,
            NOW(),
            NOW()
        )
        RETURNING * INTO new_requirement;
        
        RETURN NEXT new_requirement;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;


-- =====================================================================================
-- Function: bulk_replace_job_pre_screen_questions
-- Purpose: Atomically replace all pre-screen questions for a job with new ones
-- =====================================================================================
CREATE OR REPLACE FUNCTION bulk_replace_job_pre_screen_questions(
    p_job_id UUID,
    p_questions JSONB
)
RETURNS SETOF job_pre_screen_questions AS $$
DECLARE
    question_item JSONB;
    new_question job_pre_screen_questions;
BEGIN
    -- Delete all existing questions for this job
    DELETE FROM job_pre_screen_questions WHERE job_id = p_job_id;
    
    -- Insert new questions from JSONB array
    FOR question_item IN SELECT jsonb_array_elements(p_questions)
    LOOP
        INSERT INTO job_pre_screen_questions (
            job_id,
            question,
            question_type,
            is_required,
            sort_order,
            options,
            created_at,
            updated_at
        )
        VALUES (
            p_job_id,
            question_item->>'question',
            question_item->>'question_type',
            (question_item->>'is_required')::BOOLEAN,
            (question_item->>'sort_order')::INTEGER,
            CASE 
                WHEN question_item->'options' IS NOT NULL 
                THEN question_item->'options'
                ELSE NULL
            END,
            NOW(),
            NOW()
        )
        RETURNING * INTO new_question;
        
        RETURN NEXT new_question;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;


-- =====================================================================================
-- Grant permissions to service role
-- =====================================================================================
GRANT EXECUTE ON FUNCTION bulk_replace_job_requirements(UUID, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION bulk_replace_job_pre_screen_questions(UUID, JSONB) TO service_role;

-- =====================================================================================
-- Add comments for documentation
-- =====================================================================================
COMMENT ON FUNCTION bulk_replace_job_requirements IS 'Atomically replaces all job requirements with new ones. Used for performance optimization during job editing.';
COMMENT ON FUNCTION bulk_replace_job_pre_screen_questions IS 'Atomically replaces all job pre-screen questions with new ones. Used for performance optimization during job editing.';