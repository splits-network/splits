/**
 * Job Requirements V3 Types & JSON Schemas
 */

export interface CreateJobRequirementInput {
  job_id: string;
  requirement_type: string;
  description: string;
  sort_order: number;
}

export interface UpdateJobRequirementInput {
  requirement_type?: string;
  description?: string;
  sort_order?: number;
}

export interface JobRequirementListParams {
  job_id: string;
  page?: number;
  limit?: number;
}

export const idParamSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } },
};

export const listQuerySchema = {
  type: 'object',
  required: ['job_id'],
  properties: {
    job_id: { type: 'string', format: 'uuid' },
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 100 },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['job_id', 'requirement_type', 'description', 'sort_order'],
  properties: {
    job_id: { type: 'string', format: 'uuid' },
    requirement_type: { type: 'string', enum: ['mandatory', 'preferred'] },
    description: { type: 'string', minLength: 1, maxLength: 1000 },
    sort_order: { type: 'integer', minimum: 0 },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    requirement_type: { type: 'string', enum: ['mandatory', 'preferred'] },
    description: { type: 'string', minLength: 1, maxLength: 1000 },
    sort_order: { type: 'integer', minimum: 0 },
  },
  additionalProperties: false,
};
