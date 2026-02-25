-- Create disputes table for fee dispute resolution workflow
-- Disputes track issues raised against placements, with structured resolution process

CREATE TABLE IF NOT EXISTS public.disputes (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    placement_id uuid NOT NULL REFERENCES placements(id),
    raised_by text NOT NULL,           -- clerk_user_id of the person who raised the dispute
    raised_by_role text NOT NULL,      -- recruiter, company, platform_admin
    reason text NOT NULL,              -- description of the dispute
    dispute_type text NOT NULL,        -- fee_amount, fee_split, placement_validity, service_quality
    status text DEFAULT 'open' NOT NULL,
    resolution_notes text,
    resolved_by text,                  -- clerk_user_id of resolver
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT valid_dispute_status CHECK (status IN ('open', 'under_review', 'resolved', 'dismissed')),
    CONSTRAINT valid_dispute_type CHECK (dispute_type IN ('fee_amount', 'fee_split', 'placement_validity', 'service_quality', 'other'))
);

ALTER TABLE public.disputes OWNER TO postgres;

-- Indexes for common queries
CREATE INDEX idx_disputes_placement_id ON public.disputes(placement_id);
CREATE INDEX idx_disputes_status ON public.disputes(status) WHERE status IN ('open', 'under_review');
CREATE INDEX idx_disputes_created_at ON public.disputes(created_at DESC);
CREATE INDEX idx_disputes_raised_by ON public.disputes(raised_by);
