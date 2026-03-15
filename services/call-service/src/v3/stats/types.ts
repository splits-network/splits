/**
 * Call Stats V3 Types & JSON Schemas
 */

export interface CallStats {
  upcoming_count: number;
  this_week_count: number;
  this_month_count: number;
  avg_duration_minutes: number;
  needs_follow_up_count: number;
}

export interface StatsQueryParams {
  entity_type?: string;
  entity_id?: string;
}

export const statsQuerySchema = {
  type: 'object',
  properties: {
    entity_type: { type: 'string', enum: ['application', 'job', 'company', 'firm', 'candidate'] },
    entity_id: { type: 'string' },
  },
};
