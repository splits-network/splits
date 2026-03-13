/**
 * Invitations V3 Types & JSON Schemas
 */

export interface InvitationListParams {
  page?: number;
  limit?: number;
  organization_id?: string;
  company_id?: string;
  email?: string;
  status?: string;
  sort_by?: string;
  sort_order?: string;
}

export interface CreateInvitationInput {
  email: string;
  organization_id: string;
  company_id?: string | null;
  role: string;
}

export interface UpdateInvitationInput {
  status?: string;
}

export interface AcceptInvitationInput {
  user_email: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    organization_id: { type: 'string', format: 'uuid' },
    company_id: { type: 'string', format: 'uuid' },
    email: { type: 'string' },
    status: { type: 'string' },
    sort_by: { type: 'string', default: 'created_at' },
    sort_order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
  },
};

export const createSchema = {
  type: 'object',
  required: ['email', 'organization_id', 'role'],
  properties: {
    email: { type: 'string', format: 'email', maxLength: 255 },
    organization_id: { type: 'string', format: 'uuid' },
    company_id: { type: ['string', 'null'], format: 'uuid' },
    role: { type: 'string', minLength: 1, maxLength: 100 },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    status: { type: 'string' },
  },
  additionalProperties: false,
};

export const acceptSchema = {
  type: 'object',
  required: ['user_email'],
  properties: {
    user_email: { type: 'string', format: 'email', maxLength: 255 },
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
