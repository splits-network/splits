-- Add unique constraint to job_pre_screen_answers table
-- Ensures each application can only have one answer per question

-- First, check if there are any duplicate answers (shouldn't be, but safety first)
-- If duplicates exist, this will help identify them:
-- SELECT application_id, question_id, COUNT(*) 
-- FROM job_pre_screen_answers 
-- GROUP BY application_id, question_id 
-- HAVING COUNT(*) > 1;

-- Add the unique constraint
ALTER TABLE job_pre_screen_answers
ADD CONSTRAINT job_pre_screen_answers_application_question_unique 
UNIQUE (application_id, question_id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_job_pre_screen_answers_application 
ON job_pre_screen_answers(application_id);

CREATE INDEX IF NOT EXISTS idx_job_pre_screen_answers_question 
ON job_pre_screen_answers(question_id);
