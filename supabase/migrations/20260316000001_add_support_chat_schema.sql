-- Support Chat Schema
-- Separate from business chat (chat_conversations/chat_messages) — this is for visitor↔admin support.

BEGIN;

-- Enums
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'support_conversation_status') THEN
        CREATE TYPE public.support_conversation_status AS ENUM ('open', 'waiting_on_visitor', 'waiting_on_admin', 'resolved', 'closed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'support_category') THEN
        CREATE TYPE public.support_category AS ENUM ('feedback', 'issue', 'error', 'question');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'support_sender_type') THEN
        CREATE TYPE public.support_sender_type AS ENUM ('visitor', 'admin', 'system');
    END IF;
END $$;

-- Support conversations
CREATE TABLE public.support_conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_session_id text NOT NULL,
    clerk_user_id text NULL,
    user_id uuid NULL REFERENCES public.users(id) ON DELETE SET NULL,
    visitor_name text NULL,
    visitor_email text NULL,
    source_app text NOT NULL CHECK (source_app IN ('portal', 'candidate', 'corporate')),
    assigned_admin_id uuid NULL REFERENCES public.users(id) ON DELETE SET NULL,
    status public.support_conversation_status NOT NULL DEFAULT 'open',
    category public.support_category NULL,
    subject text NULL,
    page_url text NULL,
    user_agent text NULL,
    resolved_at timestamptz NULL,
    last_message_at timestamptz NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_conversations_status ON public.support_conversations (status, created_at DESC);
CREATE INDEX idx_support_conversations_session ON public.support_conversations (visitor_session_id);
CREATE INDEX idx_support_conversations_clerk ON public.support_conversations (clerk_user_id) WHERE clerk_user_id IS NOT NULL;
CREATE INDEX idx_support_conversations_admin ON public.support_conversations (assigned_admin_id) WHERE assigned_admin_id IS NOT NULL;

DROP TRIGGER IF EXISTS update_support_conversations_updated_at ON public.support_conversations;
CREATE TRIGGER update_support_conversations_updated_at
    BEFORE UPDATE ON public.support_conversations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Support messages
CREATE TABLE public.support_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL REFERENCES public.support_conversations(id) ON DELETE CASCADE,
    sender_type public.support_sender_type NOT NULL,
    sender_id uuid NULL REFERENCES public.users(id) ON DELETE SET NULL,
    body text NOT NULL,
    metadata jsonb NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_messages_conversation ON public.support_messages (conversation_id, created_at);

COMMIT;
