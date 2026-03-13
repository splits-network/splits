/**
 * Recruiter-Companies V3 Types & JSON Schemas
 */

export interface RecruiterCompanyPermissions {
  can_view_jobs: boolean;
  can_create_jobs: boolean;
  can_edit_jobs: boolean;
  can_advance_candidates: boolean;
  can_view_applications: boolean;
  can_submit_candidates: boolean;
}

export const DEFAULT_PERMISSIONS: RecruiterCompanyPermissions = {
  can_view_jobs: true, can_create_jobs: false, can_edit_jobs: false,
  can_advance_candidates: true, can_view_applications: true, can_submit_candidates: true,
};

export interface RecruiterCompanyListParams {
  page?: number;
  limit?: number;
  search?: string;
  recruiter_id?: string;
  company_id?: string;
  relationship_type?: string;
  status?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface RecruiterCompanyCreate {
  recruiter_id: string;
  company_id: string;
  relationship_type?: string;
  permissions?: RecruiterCompanyPermissions;
  invited_by?: string;
  request_message?: string;
}

export interface RecruiterCompanyUpdate {
  status?: string;
  permissions?: RecruiterCompanyPermissions;
  relationship_end_date?: string;
  termination_reason?: string;
  terminated_by?: string;
}

export interface InviteRecruiterInput {
  recruiter_id: string;
  company_id: string;
  relationship_type?: string;
  permissions?: RecruiterCompanyPermissions;
  message?: string;
}

export interface RespondInput {
  accept: boolean;
  permissions?: RecruiterCompanyPermissions;
}

export interface TerminateInput {
  reason: string;
}

export interface RequestConnectionInput {
  company_id: string;
  message?: string;
  relationship_type?: string;
}

// --- JSON Schemas ---

const permissionsJsonSchema = {
  type: 'object',
  properties: {
    can_view_jobs: { type: 'boolean' }, can_create_jobs: { type: 'boolean' },
    can_edit_jobs: { type: 'boolean' }, can_advance_candidates: { type: 'boolean' },
    can_view_applications: { type: 'boolean' }, can_submit_candidates: { type: 'boolean' },
  },
};

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1 }, limit: { type: 'integer', minimum: 1, maximum: 100 },
    search: { type: 'string' }, recruiter_id: { type: 'string', format: 'uuid' },
    company_id: { type: 'string', format: 'uuid' },
    status: { type: 'string', enum: ['pending', 'active', 'declined', 'terminated'] },
    relationship_type: { type: 'string', enum: ['sourcer', 'recruiter'] },
    sort_by: { type: 'string' }, sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
};

export const inviteSchema = {
  type: 'object',
  required: ['company_id', 'recruiter_id'],
  properties: {
    company_id: { type: 'string', format: 'uuid' }, recruiter_id: { type: 'string', format: 'uuid' },
    relationship_type: { type: 'string', enum: ['sourcer', 'recruiter'] },
    permissions: permissionsJsonSchema, message: { type: 'string', maxLength: 500 },
  },
};

export const respondSchema = {
  type: 'object',
  required: ['accept'],
  properties: { accept: { type: 'boolean' }, permissions: permissionsJsonSchema },
};

export const terminateSchema = {
  type: 'object',
  properties: { reason: { type: 'string', maxLength: 500 } },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: { permissions: permissionsJsonSchema, status: { type: 'string', enum: ['active', 'terminated'] } },
  additionalProperties: false,
};

export const requestConnectionSchema = {
  type: 'object',
  required: ['company_id'],
  properties: {
    company_id: { type: 'string', format: 'uuid' },
    message: { type: 'string', maxLength: 500 },
    relationship_type: { type: 'string', enum: ['sourcer', 'recruiter'] },
  },
};

export const idParamSchema = {
  type: 'object', required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } },
};

export const companyIdParamSchema = {
  type: 'object', required: ['companyId'],
  properties: { companyId: { type: 'string', format: 'uuid' } },
};
