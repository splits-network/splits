-- Transactional Outbox Pattern
-- Services write events here atomically alongside business mutations.
-- OutboxWorker (in shared-job-queue) polls this table and delivers to RabbitMQ.
-- All services share this single table, differentiated by source_service.
-- See: packages/shared-job-queue/src/index.ts -> OutboxPublisher, OutboxWorker

CREATE TABLE IF NOT EXISTS public.outbox_events (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type      TEXT        NOT NULL,
    payload         JSONB       NOT NULL,
    source_service  TEXT        NOT NULL,
    status          TEXT        NOT NULL DEFAULT 'pending',  -- pending | published | failed
    attempts        INT         NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at    TIMESTAMPTZ,
    error           TEXT,
    error_at        TIMESTAMPTZ,

    CONSTRAINT outbox_events_status_check CHECK (status IN ('pending', 'published', 'failed'))
);

-- Primary polling index: each service queries by source_service + status + created_at
CREATE INDEX IF NOT EXISTS idx_outbox_events_polling
    ON public.outbox_events (source_service, status, created_at ASC)
    WHERE status = 'pending';

-- Cleanup index: purge old published/failed rows
CREATE INDEX IF NOT EXISTS idx_outbox_events_cleanup
    ON public.outbox_events (status, created_at)
    WHERE status IN ('published', 'failed');

COMMENT ON TABLE public.outbox_events IS
    'Transactional outbox for reliable RabbitMQ event delivery. '
    'Wrote atomically with business mutations; delivered by OutboxWorker.';
