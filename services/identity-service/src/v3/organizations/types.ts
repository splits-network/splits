/**
 * Organizations V3 Types & JSON Schemas
 */

export interface OrganizationListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort_by?: string;
  sort_order?: string;
}

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  type?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  slug?: string;
  description?: string;
  avatar_url?: string;
  status?: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    search: { type: 'string' },
    status: { type: 'string' },
    sort_by: { type: 'string', default: 'created_at' },
    sort_order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['name', 'slug'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 255 },
    slug: { type: 'string', minLength: 1, maxLength: 255 },
    type: { type: 'string', maxLength: 50 },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 255 },
    slug: { type: 'string', minLength: 1, maxLength: 255 },
    description: { type: 'string', maxLength: 5000 },
    avatar_url: { type: 'string', maxLength: 1000 },
    status: { type: 'string' },
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
