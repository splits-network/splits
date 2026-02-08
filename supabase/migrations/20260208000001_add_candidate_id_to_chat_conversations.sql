-- Add candidate_id to chat_conversations for recruiter representation routing.
-- When a message is routed to a representing recruiter, candidate_id records
-- which candidate the conversation is about.

ALTER TABLE public.chat_conversations
ADD COLUMN IF NOT EXISTS candidate_id uuid NULL;

-- Index for lookups by candidate context
CREATE INDEX IF NOT EXISTS ix_chat_conversations_candidate_id
ON public.chat_conversations (candidate_id)
WHERE candidate_id IS NOT NULL;

-- Recreate unique index to include candidate_id.
-- Existing rows have candidate_id = NULL which coalesces to '' preserving uniqueness.
DROP INDEX IF EXISTS ux_chat_conversations_pair_context;

CREATE UNIQUE INDEX ux_chat_conversations_pair_context
ON public.chat_conversations (
    participant_a_id,
    participant_b_id,
    coalesce(application_id::text, ''),
    coalesce(job_id::text, ''),
    coalesce(company_id::text, ''),
    coalesce(candidate_id::text, '')
);
