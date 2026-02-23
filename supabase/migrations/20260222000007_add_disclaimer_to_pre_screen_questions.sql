-- Migration: Add disclaimer field to pre-screen questions
-- Allows sensitive questions (gender, disability, veteran, race) to include legal disclaimers

-- Add disclaimer column
ALTER TABLE job_pre_screen_questions ADD COLUMN IF NOT EXISTS disclaimer text;

-- Update the bulk replace function to include disclaimer
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
            disclaimer,
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
            question_item->>'disclaimer',
            NOW(),
            NOW()
        )
        RETURNING * INTO new_question;

        RETURN NEXT new_question;
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql;
