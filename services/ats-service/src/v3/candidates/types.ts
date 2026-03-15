/**
 * Candidates V3 Types & JSON Schemas
 */

export interface CreateCandidateInput {
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  user_id?: string;
}

export interface UpdateCandidateInput {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  verification_status?: string;
  verification_metadata?: Record<string, any>;
}

export interface CandidateListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'archived';
  activity_filter?: 'all' | 'active' | 'inactive';
  scope?: 'all' | 'mine' | 'saved';
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  include?: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    search: { type: 'string' },
    status: { type: 'string', enum: ['active', 'archived'] },
    activity_filter: { type: 'string', enum: ['all', 'active', 'inactive'], default: 'all' },
    scope: { type: 'string', enum: ['all', 'mine', 'saved'], default: 'all' },
    sort_by: { type: 'string' },
    sort_order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
    include: { type: 'string' },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['full_name', 'email'],
  properties: {
    full_name: { type: 'string', minLength: 1, maxLength: 255 },
    email: { type: 'string', format: 'email', maxLength: 255 },
    phone: { type: 'string', maxLength: 50 },
    location: { type: 'string', maxLength: 255 },
    user_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    full_name: { type: 'string', minLength: 1, maxLength: 255 },
    email: { type: 'string', format: 'email', maxLength: 255 },
    phone: { type: 'string', maxLength: 50 },
    location: { type: 'string', maxLength: 255 },
    verification_status: { type: 'string' },
    verification_metadata: { type: 'object' },
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
