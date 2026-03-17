/**
 * Assignments V3 Types & JSON Schemas
 */

export interface AssignmentListParams {
  page?: number;
  limit?: number;
  status?: string;
  recruiter_id?: string;
  job_id?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreateAssignmentInput {
  recruiter_id: string;
  job_id: string;
  status?: string;
}

export interface AssignmentUpdate {
  status?: string;
  notes?: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    status: { type: 'string' },
    recruiter_id: { type: 'string', format: 'uuid' },
    job_id: { type: 'string', format: 'uuid' },
    sort_by: { type: 'string' },
    sort_order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['recruiter_id', 'job_id'],
  properties: {
    recruiter_id: { type: 'string', format: 'uuid' },
    job_id: { type: 'string', format: 'uuid' },
    status: { type: 'string' },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    status: { type: 'string' },
    notes: { type: 'string' },
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
