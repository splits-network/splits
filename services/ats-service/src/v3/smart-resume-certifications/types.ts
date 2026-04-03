/**
 * Smart Resume Certifications V3 Types & JSON Schemas
 *
 * Child of smart_resume_profiles. Professional certifications and credentials.
 */

export interface CreateSmartResumeCertificationInput {
  profile_id: string;
  name: string;
  issuer?: string;
  date_obtained?: string;
  expiry_date?: string;
  credential_url?: string;
  visible_to_matching?: boolean;
  sort_order?: number;
}

export interface UpdateSmartResumeCertificationInput {
  name?: string;
  issuer?: string;
  date_obtained?: string;
  expiry_date?: string;
  credential_url?: string;
  visible_to_matching?: boolean;
  sort_order?: number;
}

export interface SmartResumeCertificationListParams {
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
    name: { type: 'string', minLength: 1, maxLength: 500 },
    issuer: { type: 'string', maxLength: 500 },
    date_obtained: { type: 'string' },
    expiry_date: { type: 'string' },
    credential_url: { type: 'string', maxLength: 2000 },
    visible_to_matching: { type: 'boolean' },
    sort_order: { type: 'integer', minimum: 0 },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 500 },
    issuer: { type: 'string', maxLength: 500 },
    date_obtained: { type: 'string' },
    expiry_date: { type: 'string' },
    credential_url: { type: 'string', maxLength: 2000 },
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
