-- Migration: Move pre-screen questions/answers from separate tables to JSONB columns
-- Questions → jobs.pre_screen_questions (JSONB array)
-- Answers → applications.pre_screen_answers (JSONB array with question snapshot)

-- ============================================================================
-- Step 1: Add JSONB columns
-- ============================================================================
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS pre_screen_questions JSONB DEFAULT '[]';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS pre_screen_answers JSONB DEFAULT '[]';

-- ============================================================================
-- Step 2: Migrate existing questions to jobs.pre_screen_questions
-- ============================================================================
UPDATE jobs j
SET pre_screen_questions = sub.questions
FROM (
    SELECT
        job_id,
        jsonb_agg(
            jsonb_build_object(
                'question', question,
                'question_type', question_type,
                'is_required', is_required,
                'options', COALESCE(options, 'null'::jsonb),
                'disclaimer', disclaimer
            )
            ORDER BY sort_order
        ) AS questions
    FROM job_pre_screen_questions
    GROUP BY job_id
) sub
WHERE j.id = sub.job_id;

-- ============================================================================
-- Step 3: Migrate existing answers to applications.pre_screen_answers
-- Each answer stores the full question snapshot alongside the candidate's answer
-- ============================================================================
UPDATE applications a
SET pre_screen_answers = sub.answers
FROM (
    SELECT
        ans.application_id,
        jsonb_agg(
            jsonb_build_object(
                'question', q.question,
                'question_type', q.question_type,
                'is_required', q.is_required,
                'options', COALESCE(q.options, 'null'::jsonb),
                'disclaimer', q.disclaimer,
                'answer', ans.answer
            )
            ORDER BY q.sort_order
        ) AS answers
    FROM job_pre_screen_answers ans
    JOIN job_pre_screen_questions q ON q.id = ans.question_id
    GROUP BY ans.application_id
) sub
WHERE a.id = sub.application_id;

-- ============================================================================
-- Step 4: Drop old tables (CASCADE handles FK constraints and indexes)
-- ============================================================================
DROP TABLE IF EXISTS job_pre_screen_answers CASCADE;
DROP TABLE IF EXISTS job_pre_screen_questions CASCADE;

-- ============================================================================
-- Step 5: Drop stored procedures
-- ============================================================================
DROP FUNCTION IF EXISTS bulk_replace_job_pre_screen_questions(UUID, JSONB);
