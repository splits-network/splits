/**
 * Leaderboards V3 Types & JSON Schemas
 */

export type LeaderboardPeriod = 'weekly' | 'monthly' | 'quarterly' | 'all_time';

export interface LeaderboardListParams {
  page?: number;
  limit?: number;
  entity_type: string;
  period: LeaderboardPeriod;
  metric: string;
  period_start?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const idParamSchema = { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } };

export const listQuerySchema = {
  type: 'object',
  required: ['entity_type', 'period', 'metric'],
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    entity_type: { type: 'string', enum: ['recruiter', 'candidate', 'company', 'firm'] },
    period: { type: 'string', enum: ['weekly', 'monthly', 'quarterly', 'all_time'] },
    metric: { type: 'string', minLength: 1 },
    period_start: { type: 'string' },
    sort_by: { type: 'string', enum: ['rank', 'score'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
};
