/**
 * Admin V3 Types & JSON Schemas
 */

export interface AdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  marketplace_status?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// --- JSON Schemas ---

export const adminListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100 },
    search: { type: 'string' },
    status: { type: 'string' },
    marketplace_status: { type: 'string', enum: ['pending_approval', 'approved', 'not_listed'] },
    sort_by: { type: 'string' },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
};

export const recruiterStatusSchema = {
  type: 'object',
  required: ['status'],
  properties: { status: { type: 'string' } },
  additionalProperties: false,
};

export const firmApprovalSchema = {
  type: 'object',
  required: ['approved'],
  properties: { approved: { type: 'boolean' } },
  additionalProperties: false,
};

export const idParamSchema = {
  type: 'object', required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } },
};

export const recruiterUpdateSchema = {
  type: 'object',
  properties: {
    bio: { type: 'string' },
    tagline: { type: 'string' },
    location: { type: 'string' },
    phone: { type: 'string' },
    years_experience: { type: 'integer' },
    industries: { type: 'array', items: { type: 'string' } },
    specialties: { type: 'array', items: { type: 'string' } },
    candidate_recruiter: { type: 'boolean' },
    company_recruiter: { type: 'boolean' },
    marketplace_enabled: { type: 'boolean' },
    marketplace_visibility: { type: 'string', enum: ['public', 'limited', 'hidden'] },
  },
  additionalProperties: false,
};

export const statsQuerySchema = {
  type: 'object',
  properties: {
    period: { type: 'string', enum: ['7d', '30d', '90d', '1y', 'all'], default: '30d' },
  },
};
