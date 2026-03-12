/**
 * Recruiter Saved Candidates V3 Types & JSON Schemas
 */

export interface CreateRecruiterSavedCandidateInput {
  candidate_id: string;
}

export interface RecruiterSavedCandidateListParams {
  page?: number;
  limit?: number;
  candidate_id?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
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
    sort_by: { type: 'string', enum: ['created_at'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
};

export const createSchema = {
  type: 'object',
  required: ['candidate_id'],
  properties: {
    candidate_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};
