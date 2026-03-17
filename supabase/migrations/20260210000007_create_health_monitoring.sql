-- Health monitoring: site notifications, health incidents, and raw health checks
-- Used by the health-monitor service and admin notification management

BEGIN;

-- ============================================================
-- site_notifications: Active user-facing alerts from any source
-- ============================================================
CREATE TABLE IF NOT EXISTS site_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL DEFAULT 'announcement'
        CHECK (type IN ('service_disruption', 'maintenance', 'announcement', 'feature')),
    severity TEXT NOT NULL DEFAULT 'info'
        CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    source TEXT NOT NULL DEFAULT 'admin'
        CHECK (source IN ('health-monitor', 'admin', 'system')),
    title TEXT NOT NULL,
    message TEXT,
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    dismissible BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Active notifications query (what the frontend reads)
CREATE INDEX IF NOT EXISTS idx_site_notifications_active
    ON site_notifications(is_active, starts_at, expires_at)
    WHERE is_active = true;

-- Source lookup (e.g., find all health-monitor-created notifications)
CREATE INDEX IF NOT EXISTS idx_site_notifications_source
    ON site_notifications(source);

-- Recent notifications for admin listing
CREATE INDEX IF NOT EXISTS idx_site_notifications_created_at
    ON site_notifications(created_at DESC);

-- ============================================================
-- health_incidents: Historical record of service disruptions
-- ============================================================
CREATE TABLE IF NOT EXISTS health_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'unhealthy'
        CHECK (severity IN ('degraded', 'unhealthy')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    duration_seconds INTEGER GENERATED ALWAYS AS (
        CASE WHEN resolved_at IS NOT NULL
            THEN EXTRACT(EPOCH FROM (resolved_at - started_at))::INTEGER
            ELSE NULL
        END
    ) STORED,
    error_details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Find active (unresolved) incidents for a service
CREATE INDEX IF NOT EXISTS idx_health_incidents_active
    ON health_incidents(service_name) WHERE resolved_at IS NULL;

-- Query recent incidents for the status page
CREATE INDEX IF NOT EXISTS idx_health_incidents_started_at
    ON health_incidents(started_at DESC);

-- Query by service name
CREATE INDEX IF NOT EXISTS idx_health_incidents_service_name
    ON health_incidents(service_name, started_at DESC);

-- ============================================================
-- health_checks: Raw check data for granular timeline
-- ============================================================
CREATE TABLE IF NOT EXISTS health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL,
    status TEXT NOT NULL
        CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
    response_time_ms INTEGER,
    error_message TEXT,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_details JSONB
);

-- Query checks by service and time (for timeline graphs)
CREATE INDEX IF NOT EXISTS idx_health_checks_service_time
    ON health_checks(service_name, checked_at DESC);

-- Query recent checks (for dashboard)
CREATE INDEX IF NOT EXISTS idx_health_checks_checked_at
    ON health_checks(checked_at DESC);

COMMIT;
