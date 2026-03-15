-- Support Tickets Schema
-- Async support tickets for when admins are offline. Separate from live chat conversations.

BEGIN;

-- Ticket status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'support_ticket_status') THEN
        CREATE TYPE public.support_ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
    END IF;
END $$;

-- Support tickets
CREATE TABLE public.support_tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NULL REFERENCES public.support_conversations(id) ON DELETE SET NULL,
    visitor_session_id text NOT NULL,
    clerk_user_id text NULL,
    user_id uuid NULL REFERENCES public.users(id) ON DELETE SET NULL,
    visitor_name text NULL,
    visitor_email text NULL,
    source_app text NOT NULL CHECK (source_app IN ('portal', 'candidate', 'corporate')),
    assigned_admin_id uuid NULL REFERENCES public.users(id) ON DELETE SET NULL,
    status public.support_ticket_status NOT NULL DEFAULT 'open',
    category public.support_category NOT NULL DEFAULT 'question',
    subject text NULL,
    body text NOT NULL,
    page_url text NULL,
    user_agent text NULL,
    admin_notes text NULL,
    resolved_at timestamptz NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_tickets_status ON public.support_tickets (status, created_at DESC);
CREATE INDEX idx_support_tickets_clerk ON public.support_tickets (clerk_user_id) WHERE clerk_user_id IS NOT NULL;
CREATE INDEX idx_support_tickets_admin ON public.support_tickets (assigned_admin_id) WHERE assigned_admin_id IS NOT NULL;
CREATE INDEX idx_support_tickets_session ON public.support_tickets (visitor_session_id);

DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Support ticket replies
CREATE TABLE public.support_ticket_replies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_type public.support_sender_type NOT NULL,
    sender_id uuid NULL REFERENCES public.users(id) ON DELETE SET NULL,
    body text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_ticket_replies_ticket ON public.support_ticket_replies (ticket_id, created_at);

COMMIT;
