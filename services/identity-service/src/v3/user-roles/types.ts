/**
 * User Roles V3 Types & JSON Schemas
 */

export interface UserRoleListParams {
  page?: number;
  limit?: number;
  user_id?: string;
  role_name?: string;
  sort_by?: string;
  sort_order?: string;
}

export interface CreateUserRoleInput {
  user_id: string;
  role_name: string;
  role_entity_id?: string | null;
}

export interface UpdateUserRoleInput {
  role_name?: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    user_id: { type: 'string', format: 'uuid' },
    role_name: { type: 'string' },
    sort_by: { type: 'string', default: 'created_at' },
    sort_order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
  },
};

export const createSchema = {
  type: 'object',
  required: ['user_id', 'role_name'],
  properties: {
    user_id: { type: 'string', format: 'uuid' },
    role_name: { type: 'string', minLength: 1, maxLength: 100 },
    role_entity_id: { type: ['string', 'null'], format: 'uuid' },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    role_name: { type: 'string', minLength: 1, maxLength: 100 },
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
