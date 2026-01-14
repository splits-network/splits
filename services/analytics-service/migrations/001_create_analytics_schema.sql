-- Migration: Create analytics schema and tables
-- Date: 2026-01-13
-- Description: Initial analytics schema with events, metrics tables, and BRIN indexes

-- Create analytics schema
CREATE SCHEMA IF NOT EXISTS analytics;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- Events Table (Raw Event Stream)
-- ===================================
CREATE TABLE IF NOT EXISTS analytics.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    user_id UUID,
    user_role TEXT,
    organization_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- BRIN index on created_at for efficient time-range queries
CREATE INDEX IF NOT EXISTS idx_events_created_at_brin ON analytics.events USING BRIN (created_at);
CREATE INDEX IF NOT EXISTS idx_events_type ON analytics.events (event_type);
CREATE INDEX IF NOT EXISTS idx_events_entity ON analytics.events (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_events_user ON analytics.events (user_id);

-- ===================================
-- Hourly Metrics Table
-- ===================================
CREATE TABLE IF NOT EXISTS analytics.metrics_hourly (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type TEXT NOT NULL,
    time_bucket TEXT NOT NULL DEFAULT 'hour',
    time_value TIMESTAMPTZ NOT NULL,
    dimension_user_id UUID,
    dimension_company_id UUID,
    dimension_recruiter_id UUID,
    value NUMERIC NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (metric_type, time_value, dimension_user_id, dimension_company_id, dimension_recruiter_id)
);

-- BRIN index on time_value for efficient time-range queries
CREATE INDEX IF NOT EXISTS idx_metrics_hourly_time_brin ON analytics.metrics_hourly USING BRIN (time_value);
CREATE INDEX IF NOT EXISTS idx_metrics_hourly_type ON analytics.metrics_hourly (metric_type);
CREATE INDEX IF NOT EXISTS idx_metrics_hourly_user ON analytics.metrics_hourly (dimension_user_id);
CREATE INDEX IF NOT EXISTS idx_metrics_hourly_company ON analytics.metrics_hourly (dimension_company_id);

-- ===================================
-- Daily Metrics Table
-- ===================================
CREATE TABLE IF NOT EXISTS analytics.metrics_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type TEXT NOT NULL,
    time_bucket TEXT NOT NULL DEFAULT 'day',
    time_value DATE NOT NULL,
    dimension_user_id UUID,
    dimension_company_id UUID,
    dimension_recruiter_id UUID,
    value NUMERIC NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (metric_type, time_value, dimension_user_id, dimension_company_id, dimension_recruiter_id)
);

-- BRIN index on time_value for efficient time-range queries
CREATE INDEX IF NOT EXISTS idx_metrics_daily_time_brin ON analytics.metrics_daily USING BRIN (time_value);
CREATE INDEX IF NOT EXISTS idx_metrics_daily_type ON analytics.metrics_daily (metric_type);
CREATE INDEX IF NOT EXISTS idx_metrics_daily_user ON analytics.metrics_daily (dimension_user_id);
CREATE INDEX IF NOT EXISTS idx_metrics_daily_company ON analytics.metrics_daily (dimension_company_id);

-- ===================================
-- Monthly Metrics Table
-- ===================================
CREATE TABLE IF NOT EXISTS analytics.metrics_monthly (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type TEXT NOT NULL,
    time_bucket TEXT NOT NULL DEFAULT 'month',
    time_value DATE NOT NULL, -- First day of month
    dimension_user_id UUID,
    dimension_company_id UUID,
    dimension_recruiter_id UUID,
    value NUMERIC NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (metric_type, time_value, dimension_user_id, dimension_company_id, dimension_recruiter_id)
);

-- BRIN index on time_value for efficient time-range queries
CREATE INDEX IF NOT EXISTS idx_metrics_monthly_time_brin ON analytics.metrics_monthly USING BRIN (time_value);
CREATE INDEX IF NOT EXISTS idx_metrics_monthly_type ON analytics.metrics_monthly (metric_type);
CREATE INDEX IF NOT EXISTS idx_metrics_monthly_user ON analytics.metrics_monthly (dimension_user_id);
CREATE INDEX IF NOT EXISTS idx_metrics_monthly_company ON analytics.metrics_monthly (dimension_company_id);

-- ===================================
-- Marketplace Health Daily Table
-- ===================================
CREATE TABLE IF NOT EXISTS analytics.marketplace_health_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_date DATE NOT NULL UNIQUE,
    
    -- Activity metrics
    active_recruiters INTEGER DEFAULT 0,
    active_companies INTEGER DEFAULT 0,
    active_jobs INTEGER DEFAULT 0,
    
    -- Performance metrics
    total_applications INTEGER DEFAULT 0,
    total_placements INTEGER DEFAULT 0,
    avg_time_to_hire_days DECIMAL(10, 2),
    
    -- Quality metrics
    hire_rate DECIMAL(5, 2), -- Percentage
    placement_completion_rate DECIMAL(5, 2),
    avg_recruiter_response_time_hours DECIMAL(10, 2),
    
    -- Financial metrics
    total_fees_generated DECIMAL(12, 2) DEFAULT 0,
    total_payouts_processed DECIMAL(12, 2) DEFAULT 0,
    
    -- Health indicators
    fraud_signals_raised INTEGER DEFAULT 0,
    disputes_opened INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- BRIN index on metric_date for efficient time-range queries
CREATE INDEX IF NOT EXISTS idx_marketplace_health_date_brin ON analytics.marketplace_health_daily USING BRIN (metric_date);

-- ===================================
-- Comments for documentation
-- ===================================
COMMENT ON SCHEMA analytics IS 'Analytics schema for event-driven metrics aggregation';
COMMENT ON TABLE analytics.events IS 'Raw event stream from all domain services';
COMMENT ON TABLE analytics.metrics_hourly IS 'Hourly aggregated metrics';
COMMENT ON TABLE analytics.metrics_daily IS 'Daily aggregated metrics';
COMMENT ON TABLE analytics.metrics_monthly IS 'Monthly aggregated metrics for trend analysis';
COMMENT ON TABLE analytics.marketplace_health_daily IS 'Platform-wide daily health metrics';
