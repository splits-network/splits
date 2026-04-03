/**
 * Applications V3 Types & JSON Schemas
 */

export interface CreateApplicationInput {
  job_id: string;
  candidate_id?: string;
  candidate_recruiter_id?: string;
  cover_letter?: string;
  salary_expectation?: number;
  document_ids?: string[];
  pre_screen_answers?: Array<{
    question: string;
    question_type: string;
    is_required: boolean;
    options?: string[];
    disclaimer?: string;
    answer: any;
  }>;
  application_source?: string;
  resume_data?: Record<string, any>;
}

export interface UpdateApplicationInput {
  stage?: string;
  cover_letter?: string;
  salary?: number;
  submitted_at?: string;
  hired_at?: string;
  accepted_by_company?: boolean;
  accepted_by_candidate?: boolean;
  accepted_at?: string;
  decline_reason?: string;
  decline_details?: string;
  document_ids?: string[];
  pre_screen_answers?: Array<{
    question: string;
    question_type: string;
    is_required: boolean;
    options?: string[];
    disclaimer?: string;
    answer: any;
  }>;
  resume_data?: Record<string, any>;
}

export interface ApplicationListParams {
  page?: number;
  limit?: number;
  search?: string;
  stage?: string;
  job_id?: string;
  candidate_id?: string;
  recruiter_id?: string;
  include?: string;
  sort_by?: string;
  sort_order?: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    search: { type: 'string' },
    stage: { type: 'string' },
    job_id: { type: 'string', format: 'uuid' },
    candidate_id: { type: 'string', format: 'uuid' },
    recruiter_id: { type: 'string', format: 'uuid' },
    include: { type: 'string' },
    sort_by: { type: 'string' },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['job_id'],
  properties: {
    job_id: { type: 'string', format: 'uuid' },
    candidate_id: { type: 'string', format: 'uuid' },
    candidate_recruiter_id: { type: 'string', format: 'uuid' },
    cover_letter: { type: 'string', maxLength: 10000 },
    salary_expectation: { type: 'number', minimum: 0 },
    document_ids: { type: 'array', items: { type: 'string', format: 'uuid' } },
    pre_screen_answers: { type: 'array' },
    application_source: { type: 'string' },
    resume_data: { type: 'object' },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    stage: { type: 'string' },
    cover_letter: { type: 'string', maxLength: 10000 },
    salary: { type: 'number', minimum: 0 },
    submitted_at: { type: 'string', format: 'date-time' },
    hired_at: { type: 'string', format: 'date-time' },
    accepted_by_company: { type: 'boolean' },
    accepted_by_candidate: { type: 'boolean' },
    accepted_at: { type: 'string', format: 'date-time' },
    decline_reason: { type: 'string', maxLength: 2000 },
    decline_details: { type: 'string', maxLength: 5000 },
    document_ids: { type: 'array', items: { type: 'string', format: 'uuid' } },
    pre_screen_answers: { type: 'array' },
    resume_data: { type: 'object' },
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
