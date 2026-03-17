/**
 * AI Reviews V3 Types & JSON Schemas
 */

export interface AIReviewListParams {
  page?: number;
  limit?: number;
  application_id?: string;
  job_id?: string;
  recommendation?: string;
  fit_score_min?: number;
  fit_score_max?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreateReviewInput {
  application_id: string;
  candidate_id: string;
  job_id: string;
  resume_text?: string;
  job_description: string;
  job_title: string;
  required_skills: string[];
  preferred_skills?: string[];
  required_years?: number;
  candidate_location?: string;
  job_location?: string;
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
    application_id: { type: 'string', format: 'uuid' },
    job_id: { type: 'string', format: 'uuid' },
    recommendation: { type: 'string', enum: ['strong_fit', 'good_fit', 'fair_fit', 'poor_fit'] },
    fit_score_min: { type: 'number', minimum: 0, maximum: 100 },
    fit_score_max: { type: 'number', minimum: 0, maximum: 100 },
    sort_by: { type: 'string', enum: ['created_at', 'fit_score'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
  additionalProperties: false,
};

export const createReviewSchema = {
  type: 'object',
  required: ['application_id', 'candidate_id', 'job_id', 'job_description', 'job_title', 'required_skills'],
  properties: {
    application_id: { type: 'string', format: 'uuid' },
    candidate_id: { type: 'string', format: 'uuid' },
    job_id: { type: 'string', format: 'uuid' },
    resume_text: { type: 'string' },
    job_description: { type: 'string', minLength: 1 },
    job_title: { type: 'string', minLength: 1 },
    required_skills: { type: 'array', items: { type: 'string' } },
    preferred_skills: { type: 'array', items: { type: 'string' } },
    required_years: { type: 'integer', minimum: 0 },
    candidate_location: { type: 'string' },
    job_location: { type: 'string' },
  },
  additionalProperties: false,
};
