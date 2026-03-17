-- Add gpt_review and ai_failed to application stage constraint
-- gpt_review: GPT-submitted applications (distinct from user-submitted ai_review)
-- ai_failed: AI review failed/errored — candidate can resubmit for review

ALTER TABLE "public"."applications"
  DROP CONSTRAINT "applications_stage_check",
  ADD CONSTRAINT "applications_stage_check" CHECK (
    stage = ANY (ARRAY[
      'draft'::text,
      'ai_review'::text,
      'ai_reviewed'::text,
      'ai_failed'::text,
      'gpt_review'::text,
      'recruiter_request'::text,
      'recruiter_proposed'::text,
      'recruiter_review'::text,
      'screen'::text,
      'submitted'::text,
      'company_review'::text,
      'company_feedback'::text,
      'interview'::text,
      'offer'::text,
      'hired'::text,
      'rejected'::text,
      'withdrawn'::text,
      'expired'::text
    ])
  );
