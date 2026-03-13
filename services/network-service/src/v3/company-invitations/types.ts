/**
 * Company-Invitations V3 Types & JSON Schemas
 */

export interface CompanyInvitationListParams {
  page?: number;
  limit?: number;
  search?: string;
  recruiter_id?: string;
  status?: string;
  invited_email?: string;
  has_email?: string;
  expiry_status?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreateCompanyInvitationInput {
  invited_email?: string;
  company_name_hint?: string;
  personal_message?: string;
  send_email?: boolean;
}

export interface CompleteRelationshipInput {
  invitation_id: string;
  company_id: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1 }, limit: { type: 'integer', minimum: 1, maximum: 100 },
    search: { type: 'string' },
    sort_by: { type: 'string', enum: ['created_at', 'status', 'expires_at'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
    status: { type: 'string', enum: ['pending', 'accepted', 'expired', 'revoked'] },
  },
};

export const createSchema = {
  type: 'object',
  properties: {
    invited_email: { type: 'string', format: 'email' },
    company_name_hint: { type: 'string', maxLength: 255 },
    personal_message: { type: 'string', maxLength: 1000 },
    send_email: { type: 'boolean' },
  },
};

export const completeRelationshipSchema = {
  type: 'object',
  required: ['invitation_id', 'company_id'],
  properties: {
    invitation_id: { type: 'string', format: 'uuid' },
    company_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export const lookupQuerySchema = {
  type: 'object',
  properties: { code: { type: 'string' }, token: { type: 'string' } },
};

export const idParamSchema = {
  type: 'object', required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } },
};
