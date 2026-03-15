/**
 * Recruiter-Candidates V3 Types & JSON Schemas
 */

export interface RecruiterCandidateListParams {
  page?: number;
  limit?: number;
  search?: string;
  recruiter_id?: string;
  candidate_id?: string;
  status?: string;
  consent_status?: string;
  expiry_status?: string;
  include?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface CreateRecruiterCandidateInput {
  recruiter_id: string;
  candidate_id: string;
  status?: string;
}

export interface RecruiterCandidateUpdate {
  status?: string;
  resend_invitation?: boolean;
  cancel_invitation?: boolean;
  [key: string]: any;
}

export interface TerminateInput {
  reason: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    search: { type: 'string' },
    recruiter_id: { type: 'string', format: 'uuid' },
    candidate_id: { type: 'string', format: 'uuid' },
    status: { type: 'string' },
    include: { type: 'string' },
    sort_by: { type: 'string' },
    sort_order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
    filters: { type: 'string' },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['recruiter_id', 'candidate_id'],
  properties: {
    recruiter_id: { type: 'string', format: 'uuid' },
    candidate_id: { type: 'string', format: 'uuid' },
    status: { type: 'string' },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    status: { type: 'string' },
    resend_invitation: { type: 'boolean' },
    cancel_invitation: { type: 'boolean' },
  },
  additionalProperties: false,
};

export const terminateSchema = {
  type: 'object',
  required: ['reason'],
  properties: {
    reason: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
};

export const idParamSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } },
};

export const tokenParamSchema = {
  type: 'object',
  required: ['token'],
  properties: { token: { type: 'string' } },
};
