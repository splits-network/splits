/**
 * Smart Resume Tasks V3 Types & JSON Schemas
 *
 * Accomplishments/tasks linked to a profile, optionally to an experience or project.
 * Table: smart_resume_tasks
 * Parent FK: profile_id -> smart_resume_profiles(id)
 * Optional FKs: experience_id -> smart_resume_experiences(id), project_id -> smart_resume_projects(id)
 */

export interface CreateSmartResumeTaskInput {
  profile_id: string;
  experience_id?: string;
  project_id?: string;
  description: string;
  impact?: string;
  skills_used?: string[];
  visible_to_matching?: boolean;
  sort_order?: number;
}

export interface UpdateSmartResumeTaskInput {
  experience_id?: string | null;
  project_id?: string | null;
  description?: string;
  impact?: string;
  skills_used?: string[];
  visible_to_matching?: boolean;
  sort_order?: number;
}

export interface SmartResumeTaskListParams {
  page?: number;
  limit?: number;
  profile_id: string;
  experience_id?: string;
  project_id?: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  required: ['profile_id'],
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    profile_id: { type: 'string', format: 'uuid' },
    experience_id: { type: 'string', format: 'uuid' },
    project_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['profile_id', 'description'],
  properties: {
    profile_id: { type: 'string', format: 'uuid' },
    experience_id: { type: 'string', format: 'uuid' },
    project_id: { type: 'string', format: 'uuid' },
    description: { type: 'string', minLength: 1, maxLength: 2000 },
    impact: { type: 'string', maxLength: 2000 },
    skills_used: { type: 'array', items: { type: 'string' } },
    visible_to_matching: { type: 'boolean', default: true },
    sort_order: { type: 'integer', default: 0 },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    experience_id: { type: ['string', 'null'], format: 'uuid' },
    project_id: { type: ['string', 'null'], format: 'uuid' },
    description: { type: 'string', minLength: 1, maxLength: 2000 },
    impact: { type: 'string', maxLength: 2000 },
    skills_used: { type: 'array', items: { type: 'string' } },
    visible_to_matching: { type: 'boolean' },
    sort_order: { type: 'integer' },
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
