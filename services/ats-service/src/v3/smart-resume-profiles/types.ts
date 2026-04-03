/**
 * Smart Resume Profiles V3 Types & JSON Schemas
 *
 * Master record per candidate (1:1). All smart_resume_ child tables reference this.
 */

export interface CreateSmartResumeProfileInput {
  candidate_id: string;
  professional_summary?: string;
  headline?: string;
  total_years_experience?: number;
  highest_degree?: string;
}

export interface UpdateSmartResumeProfileInput {
  professional_summary?: string;
  headline?: string;
  total_years_experience?: number;
  highest_degree?: string;
}

export interface SmartResumeProfileListParams {
  page?: number;
  limit?: number;
  candidate_id?: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    candidate_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['candidate_id'],
  properties: {
    candidate_id: { type: 'string', format: 'uuid' },
    professional_summary: { type: 'string', maxLength: 5000 },
    headline: { type: 'string', maxLength: 500 },
    total_years_experience: { type: 'number', minimum: 0, maximum: 99 },
    highest_degree: { type: 'string', maxLength: 100 },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    professional_summary: { type: 'string', maxLength: 5000 },
    headline: { type: 'string', maxLength: 500 },
    total_years_experience: { type: 'number', minimum: 0, maximum: 99 },
    highest_degree: { type: 'string', maxLength: 100 },
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
