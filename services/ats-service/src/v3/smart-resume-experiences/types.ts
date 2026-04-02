/**
 * Smart Resume Experiences V3 Types & JSON Schemas
 *
 * Child of smart_resume_profiles. Work history entries for a candidate's smart resume.
 */

export interface CreateSmartResumeExperienceInput {
  profile_id: string;
  company: string;
  title: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
  achievements?: string[];
  visible_to_matching?: boolean;
  sort_order?: number;
}

export interface UpdateSmartResumeExperienceInput {
  company?: string;
  title?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
  achievements?: string[];
  visible_to_matching?: boolean;
  sort_order?: number;
}

export interface SmartResumeExperienceListParams {
  page?: number;
  limit?: number;
  profile_id: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  required: ['profile_id'],
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    profile_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['profile_id', 'company', 'title'],
  properties: {
    profile_id: { type: 'string', format: 'uuid' },
    company: { type: 'string', minLength: 1, maxLength: 500 },
    title: { type: 'string', minLength: 1, maxLength: 500 },
    location: { type: 'string', maxLength: 500 },
    start_date: { type: 'string' },
    end_date: { type: 'string' },
    is_current: { type: 'boolean' },
    description: { type: 'string', maxLength: 5000 },
    achievements: { type: 'array', items: { type: 'string' } },
    visible_to_matching: { type: 'boolean' },
    sort_order: { type: 'integer', minimum: 0 },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    company: { type: 'string', minLength: 1, maxLength: 500 },
    title: { type: 'string', minLength: 1, maxLength: 500 },
    location: { type: 'string', maxLength: 500 },
    start_date: { type: 'string' },
    end_date: { type: 'string' },
    is_current: { type: 'boolean' },
    description: { type: 'string', maxLength: 5000 },
    achievements: { type: 'array', items: { type: 'string' } },
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
