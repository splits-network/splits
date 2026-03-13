/**
 * Matches V3 Types & JSON Schemas
 */

export type MatchStatus = 'active' | 'dismissed' | 'applied';
export type MatchTier = 'standard' | 'true';
export type InviteStatus = 'sent' | 'denied' | 'applied';

export interface MatchListParams {
  page?: number;
  limit?: number;
  candidate_id?: string;
  job_id?: string;
  match_tier?: string;
  status?: string;
  min_score?: number;
  invite_status?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface UpdateMatchInput {
  status?: MatchStatus;
  dismissed_by?: string;
  dismissed_at?: string;
  invited_by?: string;
  invited_at?: string;
  invite_status?: InviteStatus;
}

export const idParamSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } },
};

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    candidate_id: { type: 'string', format: 'uuid' },
    job_id: { type: 'string', format: 'uuid' },
    match_tier: { type: 'string', enum: ['standard', 'true'] },
    status: { type: 'string', enum: ['active', 'dismissed', 'applied'] },
    min_score: { type: 'number', minimum: 0, maximum: 100 },
    invite_status: { type: 'string', enum: ['sent', 'denied', 'applied'] },
    sort_by: { type: 'string', enum: ['created_at', 'match_score'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
};

export const updateMatchSchema = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['active', 'dismissed', 'applied'] },
  },
  additionalProperties: false,
};
