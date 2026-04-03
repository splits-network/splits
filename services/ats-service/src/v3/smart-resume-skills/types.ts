/**
 * Smart Resume Skills V3 Types & JSON Schemas
 *
 * Child of smart_resume_profiles. Skills with optional FK to skills table.
 */

export interface CreateSmartResumeSkillInput {
  profile_id: string;
  skill_id?: string;
  name: string;
  category?: string;
  proficiency?: 'expert' | 'advanced' | 'intermediate' | 'beginner';
  years_used?: number;
  visible_to_matching?: boolean;
  sort_order?: number;
}

export interface UpdateSmartResumeSkillInput {
  skill_id?: string;
  name?: string;
  category?: string;
  proficiency?: 'expert' | 'advanced' | 'intermediate' | 'beginner';
  years_used?: number;
  visible_to_matching?: boolean;
  sort_order?: number;
}

export interface SmartResumeSkillListParams {
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
  required: ['profile_id', 'name'],
  properties: {
    profile_id: { type: 'string', format: 'uuid' },
    skill_id: { type: 'string', format: 'uuid' },
    name: { type: 'string', minLength: 1, maxLength: 200 },
    category: { type: 'string', maxLength: 100 },
    proficiency: { type: 'string', enum: ['expert', 'advanced', 'intermediate', 'beginner'] },
    years_used: { type: 'number', minimum: 0, maximum: 99 },
    visible_to_matching: { type: 'boolean' },
    sort_order: { type: 'integer', minimum: 0 },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    skill_id: { type: 'string', format: 'uuid' },
    name: { type: 'string', minLength: 1, maxLength: 200 },
    category: { type: 'string', maxLength: 100 },
    proficiency: { type: 'string', enum: ['expert', 'advanced', 'intermediate', 'beginner'] },
    years_used: { type: 'number', minimum: 0, maximum: 99 },
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
