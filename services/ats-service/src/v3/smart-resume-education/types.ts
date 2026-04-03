/**
 * Smart Resume Education V3 Types & JSON Schemas
 *
 * Education records linked to a smart resume profile.
 * Table: smart_resume_education
 * Parent FK: profile_id -> smart_resume_profiles(id)
 */

export interface CreateSmartResumeEducationInput {
  profile_id: string;
  institution: string;
  degree?: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  gpa?: string;
  honors?: string;
  visible_to_matching?: boolean;
  sort_order?: number;
}

export interface UpdateSmartResumeEducationInput {
  institution?: string;
  degree?: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  gpa?: string;
  honors?: string;
  visible_to_matching?: boolean;
  sort_order?: number;
}

export interface SmartResumeEducationListParams {
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
  required: ['profile_id', 'institution'],
  properties: {
    profile_id: { type: 'string', format: 'uuid' },
    institution: { type: 'string', minLength: 1, maxLength: 500 },
    degree: { type: 'string', maxLength: 500 },
    field_of_study: { type: 'string', maxLength: 500 },
    start_date: { type: 'string' },
    end_date: { type: 'string' },
    gpa: { type: 'string', maxLength: 20 },
    honors: { type: 'string', maxLength: 500 },
    visible_to_matching: { type: 'boolean', default: true },
    sort_order: { type: 'integer', default: 0 },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    institution: { type: 'string', minLength: 1, maxLength: 500 },
    degree: { type: 'string', maxLength: 500 },
    field_of_study: { type: 'string', maxLength: 500 },
    start_date: { type: 'string' },
    end_date: { type: 'string' },
    gpa: { type: 'string', maxLength: 20 },
    honors: { type: 'string', maxLength: 500 },
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
