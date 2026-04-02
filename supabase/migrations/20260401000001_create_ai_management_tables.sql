-- AI Model Management: configs, pricing, and usage tracking
-- Enables admin-configurable AI provider/model per operation with cost tracking

-- ============================================================
-- 1. ai_model_configs — operation → provider + model mapping
-- ============================================================
CREATE TABLE ai_model_configs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation   TEXT NOT NULL UNIQUE,
    provider    TEXT NOT NULL,
    model       TEXT NOT NULL,
    temperature NUMERIC(3,2),
    max_tokens  INTEGER,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_amc_provider CHECK (provider IN ('openai', 'anthropic')),
    CONSTRAINT chk_amc_operation CHECK (operation IN (
        'fit_review', 'resume_extraction', 'call_summarization',
        'resume_generation', 'resume_parsing', 'embedding', 'matching_scoring'
    ))
);

ALTER TABLE ai_model_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_model_configs_service_role" ON ai_model_configs
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed defaults matching current env var configuration
INSERT INTO ai_model_configs (operation, provider, model, temperature, max_tokens) VALUES
    ('fit_review',          'openai', 'gpt-4o-mini', 0.30,  2000),
    ('resume_extraction',   'openai', 'gpt-4o-mini', 0.10,  4000),
    ('call_summarization',  'openai', 'gpt-4o-mini', 0.30,  1500),
    ('resume_generation',   'openai', 'gpt-4o',      0.30,  4000),
    ('resume_parsing',      'openai', 'gpt-4o',      0.10, 16000),
    ('embedding',           'openai', 'text-embedding-3-small', NULL, NULL),
    ('matching_scoring',    'openai', 'gpt-4o-mini', 0.30,   500);


-- ============================================================
-- 2. ai_model_pricing — cost per 1K tokens for estimation
-- ============================================================
CREATE TABLE ai_model_pricing (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider              TEXT NOT NULL,
    model                 TEXT NOT NULL,
    input_cost_per_1k     NUMERIC(10,6) NOT NULL DEFAULT 0,
    output_cost_per_1k    NUMERIC(10,6) NOT NULL DEFAULT 0,
    embedding_cost_per_1k NUMERIC(10,6),
    effective_from        TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (provider, model, effective_from)
);

ALTER TABLE ai_model_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_model_pricing_service_role" ON ai_model_pricing
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "ai_model_pricing_select" ON ai_model_pricing
    FOR SELECT TO authenticated USING (true);

-- Seed current pricing (April 2026 reference rates)
INSERT INTO ai_model_pricing (provider, model, input_cost_per_1k, output_cost_per_1k) VALUES
    ('openai',    'gpt-4o',                        0.002500, 0.010000),
    ('openai',    'gpt-4o-mini',                   0.000150, 0.000600),
    ('anthropic', 'claude-3-5-haiku-20241022',     0.000800, 0.004000),
    ('anthropic', 'claude-sonnet-4-5-20250514',    0.003000, 0.015000);

INSERT INTO ai_model_pricing (provider, model, input_cost_per_1k, output_cost_per_1k, embedding_cost_per_1k) VALUES
    ('openai', 'text-embedding-3-small', 0, 0, 0.000020);


-- ============================================================
-- 3. ai_usage_logs — per-call token and cost tracking
-- ============================================================
CREATE TABLE ai_usage_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation       TEXT NOT NULL,
    provider        TEXT NOT NULL,
    model           TEXT NOT NULL,
    service_name    TEXT NOT NULL,
    input_tokens    INTEGER NOT NULL DEFAULT 0,
    output_tokens   INTEGER NOT NULL DEFAULT 0,
    total_tokens    INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
    estimated_cost  NUMERIC(10,6),
    duration_ms     INTEGER,
    success         BOOLEAN NOT NULL DEFAULT true,
    error_code      TEXT,
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_aul_operation ON ai_usage_logs (operation);
CREATE INDEX idx_aul_service   ON ai_usage_logs (service_name);
CREATE INDEX idx_aul_created   ON ai_usage_logs (created_at DESC);
CREATE INDEX idx_aul_provider  ON ai_usage_logs (provider, model);

ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_usage_logs_service_role" ON ai_usage_logs
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "ai_usage_logs_select" ON ai_usage_logs
    FOR SELECT TO authenticated USING (true);
