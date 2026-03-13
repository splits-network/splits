/**
 * Charts V3 Types & JSON Schemas
 *
 * Chart data served via analytics schema RPC + real-time fallback queries.
 * Charts are read-only views — no CRUD.
 */

export type ChartType =
  | 'recruiter-activity'
  | 'application-trends'
  | 'placement-trends'
  | 'placement-stacked'
  | 'role-trends'
  | 'candidate-trends'
  | 'time-to-hire-trends'
  | 'submission-trends'
  | 'submission-heatmap'
  | 'earnings-trends'
  | 'time-to-place-trends'
  | 'commission-breakdown'
  | 'recruitment-funnel'
  | 'reputation-radar'
  | 'hiring-pipeline'
  | 'company-health-radar'
  | 'recruiter-growth-trends'
  | 'platform-revenue-trends'
  | 'marketplace-health-radar'
  | 'platform-pipeline'
  | 'user-growth-by-type';

export interface ChartFilters {
  months?: number;
  start_date?: string;
  end_date?: string;
  recruiter_id?: string;
  company_id?: string;
  scope?: 'recruiter' | 'candidate' | 'company' | 'platform';
}

// --- JSON Schemas ---

export const chartTypeParamSchema = {
  type: 'object',
  required: ['type'],
  properties: {
    type: {
      type: 'string',
      enum: [
        'recruiter-activity', 'application-trends', 'placement-trends',
        'placement-stacked', 'role-trends', 'candidate-trends',
        'time-to-hire-trends', 'submission-trends', 'submission-heatmap',
        'earnings-trends', 'time-to-place-trends', 'commission-breakdown',
        'recruitment-funnel', 'reputation-radar', 'hiring-pipeline',
        'company-health-radar', 'recruiter-growth-trends',
        'platform-revenue-trends', 'marketplace-health-radar',
        'platform-pipeline', 'user-growth-by-type',
      ],
    },
  },
};

export const chartQuerySchema = {
  type: 'object',
  properties: {
    months: { type: 'integer', minimum: 1, maximum: 24, default: 12 },
    start_date: { type: 'string' },
    end_date: { type: 'string' },
    recruiter_id: { type: 'string', format: 'uuid' },
    company_id: { type: 'string', format: 'uuid' },
    scope: { type: 'string', enum: ['recruiter', 'candidate', 'company', 'platform'] },
  },
};
