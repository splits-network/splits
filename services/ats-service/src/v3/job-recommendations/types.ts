/**
 * Job Recommendations V3 Types & JSON Schemas
 */

export interface CreateJobRecommendationInput {
  job_id: string;
  candidate_id: string;
  message?: string;
}

export interface UpdateJobRecommendationInput {
  status: 'viewed' | 'applied' | 'dismissed';
}

export interface JobRecommendationListParams {
  page?: number;
  limit?: number;
  candidate_id?: string;
  job_id?: string;
  status?: string;
}

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    candidate_id: { type: 'string', format: 'uuid' },
    job_id: { type: 'string', format: 'uuid' },
    status: { type: 'string', enum: ['pending', 'viewed', 'applied', 'dismissed'] },
  },
};

export const createSchema = {
  type: 'object',
  required: ['job_id', 'candidate_id'],
  properties: {
    job_id: { type: 'string', format: 'uuid' },
    candidate_id: { type: 'string', format: 'uuid' },
    message: { type: 'string', maxLength: 2000 },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  required: ['status'],
  properties: {
    status: { type: 'string', enum: ['viewed', 'applied', 'dismissed'] },
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
