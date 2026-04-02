/**
 * Smart Resume Projects V3 Types & JSON Schemas
 *
 * Child of smart_resume_profiles, optionally linked to a smart_resume_experience.
 * Notable projects, portfolio pieces, or key deliverables.
 */

export interface CreateSmartResumeProjectInput {
  profile_id: string;
  experience_id?: string;
  name: string;
  description?: string;
  outcomes?: string;
  url?: string;
  start_date?: string;
  end_date?: string;
  skills_used?: string[];
  visible_to_matching?: boolean;
  sort_order?: number;
}

export interface UpdateSmartResumeProjectInput {
  experience_id?: string | null;
  name?: string;
  description?: string;
  outcomes?: string;
  url?: string;
  start_date?: string;
  end_date?: string;
  skills_used?: string[];
  visible_to_matching?: boolean;
  sort_order?: number;
}

export interface SmartResumeProjectListParams {
  page?: number;
  limit?: number;
  profile_id: string;
  experience_id?: string;
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
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['profile_id', 'name'],
  properties: {
    profile_id: { type: 'string', format: 'uuid' },
    experience_id: { type: 'string', format: 'uuid' },
    name: { type: 'string', minLength: 1, maxLength: 500 },
    description: { type: 'string', maxLength: 5000 },
    outcomes: { type: 'string', maxLength: 2000 },
    url: { type: 'string', maxLength: 2000 },
    start_date: { type: 'string' },
    end_date: { type: 'string' },
    skills_used: { type: 'array', items: { type: 'string' } },
    visible_to_matching: { type: 'boolean' },
    sort_order: { type: 'integer', minimum: 0 },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    experience_id: { type: ['string', 'null'], format: 'uuid' },
    name: { type: 'string', minLength: 1, maxLength: 500 },
    description: { type: 'string', maxLength: 5000 },
    outcomes: { type: 'string', maxLength: 2000 },
    url: { type: 'string', maxLength: 2000 },
    start_date: { type: 'string' },
    end_date: { type: 'string' },
    skills_used: { type: 'array', items: { type: 'string' } },
    visible_to_matching: { type: 'boolean' },
    sort_order: { type: 'integer', minimum: 0 },
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
