/**
 * Recruiter-Codes V3 Types & JSON Schemas
 */

export interface RecruiterCodeListParams {
  page?: number;
  limit?: number;
  search?: string;
  recruiter_id?: string;
  status?: string;
  is_default?: string;
  expiry_status?: string;
  has_usage_limit?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreateRecruiterCodeInput {
  label?: string;
  is_default?: boolean;
  expiry_date?: string;
  max_uses?: number;
  uses_remaining?: number;
}

export interface RecruiterCodeUpdate {
  label?: string;
  status?: string;
  is_default?: boolean;
  expiry_date?: string | null;
  max_uses?: number | null;
  uses_remaining?: number | null;
}

export interface LogCodeUsageInput {
  code: string;
  signup_type?: string;
  ip_address?: string;
  user_agent?: string;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1 }, limit: { type: 'integer', minimum: 1, maximum: 100 },
    search: { type: 'string' }, status: { type: 'string', enum: ['active', 'inactive'] },
    sort_by: { type: 'string' }, sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
};

export const createSchema = {
  type: 'object',
  properties: {
    label: { type: 'string', maxLength: 255 }, is_default: { type: 'boolean' },
    expiry_date: { type: 'string', format: 'date-time' },
    max_uses: { type: 'integer', minimum: 1 }, uses_remaining: { type: 'integer', minimum: 0 },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    label: { type: 'string', maxLength: 255 }, status: { type: 'string', enum: ['active', 'inactive'] },
    is_default: { type: 'boolean' }, expiry_date: { type: ['string', 'null'] },
    max_uses: { type: ['integer', 'null'] }, uses_remaining: { type: ['integer', 'null'] },
  },
  additionalProperties: false,
};

export const lookupQuerySchema = {
  type: 'object', required: ['code'],
  properties: { code: { type: 'string' } },
};

export const logUsageSchema = {
  type: 'object', required: ['code'],
  properties: {
    code: { type: 'string' }, signup_type: { type: 'string' },
    ip_address: { type: 'string' }, user_agent: { type: 'string' },
  },
  additionalProperties: false,
};

export const logListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1 }, limit: { type: 'integer', minimum: 1, maximum: 100 },
    recruiter_code_id: { type: 'string', format: 'uuid' },
  },
};

export const idParamSchema = {
  type: 'object', required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } },
};
