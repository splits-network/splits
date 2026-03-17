/**
 * Memberships V3 Types & JSON Schemas
 */

export interface MembershipListParams {
  page?: number;
  limit?: number;
  user_id?: string;
  role_name?: string;
  organization_id?: string;
  company_id?: string;
  sort_by?: string;
  sort_order?: string;
}

export interface CreateMembershipInput {
  user_id: string;
  role_name: string;
  organization_id: string;
  company_id?: string | null;
}

export interface UpdateMembershipInput {
  role_name?: string;
  company_id?: string | null;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    user_id: { type: 'string', format: 'uuid' },
    role_name: { type: 'string' },
    organization_id: { type: 'string', format: 'uuid' },
    company_id: { type: 'string', format: 'uuid' },
    sort_by: { type: 'string', default: 'created_at' },
    sort_order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['user_id', 'role_name', 'organization_id'],
  properties: {
    user_id: { type: 'string', format: 'uuid' },
    role_name: { type: 'string', minLength: 1, maxLength: 100 },
    organization_id: { type: 'string', format: 'uuid' },
    company_id: { type: ['string', 'null'], format: 'uuid' },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    role_name: { type: 'string', minLength: 1, maxLength: 100 },
    company_id: { type: ['string', 'null'], format: 'uuid' },
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
