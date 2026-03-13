/**
 * Reputation V3 Types & JSON Schemas
 */

export type ReputationTier = 'elite' | 'pro' | 'active' | 'new';

export interface ReputationListParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const recruiterIdParamSchema = {
  type: 'object',
  required: ['recruiterId'],
  properties: { recruiterId: { type: 'string', format: 'uuid' } },
};

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    sort_by: { type: 'string', enum: ['reputation_score', 'updated_at'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
};

export function getTierFromScore(score: number): ReputationTier {
  if (score >= 90) return 'elite';
  if (score >= 70) return 'pro';
  if (score >= 40) return 'active';
  return 'new';
}
