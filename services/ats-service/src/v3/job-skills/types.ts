/**
 * Job Skills V3 Types & JSON Schemas
 */

export interface CreateJobSkillInput {
  job_id: string;
  skill_id: string;
  is_required?: boolean;
}

export interface JobSkillListParams {
  job_id: string;
  page?: number;
  limit?: number;
}

export const listQuerySchema = {
  type: 'object',
  required: ['job_id'],
  properties: {
    job_id: { type: 'string', format: 'uuid' },
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 100 },
  },
};

export const createSchema = {
  type: 'object',
  required: ['job_id', 'skill_id'],
  properties: {
    job_id: { type: 'string', format: 'uuid' },
    skill_id: { type: 'string', format: 'uuid' },
    is_required: { type: 'boolean', default: true },
  },
  additionalProperties: false,
};

export const deleteParamsSchema = {
  type: 'object',
  required: ['jobId', 'skillId'],
  properties: {
    jobId: { type: 'string', format: 'uuid' },
    skillId: { type: 'string', format: 'uuid' },
  },
};
