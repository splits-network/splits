/**
 * Stats V3 Types & JSON Schemas
 *
 * Scope-based statistics (recruiter/candidate/company/platform).
 * Real-time computation from source tables — no dedicated stats table.
 */

export type StatsScope = 'recruiter' | 'candidate' | 'company' | 'platform';
export type StatsRange = '7d' | '30d' | '90d' | 'ytd' | 'mtd' | 'all';

export interface StatsQueryParams {
  scope?: StatsScope;
  range?: StatsRange;
}

export interface PlatformSummary {
  active_jobs: number;
  total_recruiters: number;
  active_companies: number;
  cumulative_placements: number;
  as_of: string | null;
}

// --- JSON Schemas ---

export const statsQuerySchema = {
  type: 'object',
  properties: {
    scope: {
      type: 'string',
      enum: ['recruiter', 'candidate', 'company', 'platform'],
    },
    range: {
      type: 'string',
      enum: ['7d', '30d', '90d', 'ytd', 'mtd', 'all'],
    },
  },
};
