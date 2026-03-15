/**
 * Marketplace Metrics V3 Types & JSON Schemas
 *
 * Table: analytics.marketplace_health_daily
 * Admin-only CRUD for daily marketplace health snapshots.
 */

export interface MarketplaceMetricListParams {
  page?: number;
  limit?: number;
  date_from?: string;
  date_to?: string;
}

export interface CreateMetricInput {
  date: string;
  total_placements: number;
  total_applications: number;
  total_earnings_cents: number;
  avg_placement_duration_days?: number | null;
  active_recruiters: number;
  active_jobs: number;
  health_score: number;
}

export interface UpdateMetricInput {
  date?: string;
  total_placements?: number;
  total_applications?: number;
  total_earnings_cents?: number;
  avg_placement_duration_days?: number | null;
  active_recruiters?: number;
  active_jobs?: number;
  health_score?: number;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    date_from: { type: 'string' },
    date_to: { type: 'string' },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: [
    'date', 'total_placements', 'total_applications',
    'total_earnings_cents', 'active_recruiters', 'active_jobs', 'health_score',
  ],
  properties: {
    date: { type: 'string' },
    total_placements: { type: 'integer', minimum: 0 },
    total_applications: { type: 'integer', minimum: 0 },
    total_earnings_cents: { type: 'integer', minimum: 0 },
    avg_placement_duration_days: { type: ['number', 'null'] },
    active_recruiters: { type: 'integer', minimum: 0 },
    active_jobs: { type: 'integer', minimum: 0 },
    health_score: { type: 'number', minimum: 0, maximum: 100 },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    date: { type: 'string' },
    total_placements: { type: 'integer', minimum: 0 },
    total_applications: { type: 'integer', minimum: 0 },
    total_earnings_cents: { type: 'integer', minimum: 0 },
    avg_placement_duration_days: { type: ['number', 'null'] },
    active_recruiters: { type: 'integer', minimum: 0 },
    active_jobs: { type: 'integer', minimum: 0 },
    health_score: { type: 'number', minimum: 0, maximum: 100 },
  },
  additionalProperties: false,
};

export const idParamSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
};
