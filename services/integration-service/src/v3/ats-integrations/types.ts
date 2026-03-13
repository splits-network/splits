/**
 * ATS Integrations V3 Types & JSON Schemas
 */

export interface CreateATSInput {
  company_id: string;
  platform: string;
  api_key: string;
  api_url?: string;
  sync_enabled?: boolean;
}

export interface UpdateATSInput {
  sync_enabled?: boolean;
  sync_roles?: boolean;
  sync_candidates?: boolean;
  sync_applications?: boolean;
  sync_interviews?: boolean;
}

export interface ATSListParams {
  page?: number;
  limit?: number;
  company_id?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const idParamSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } },
};

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    company_id: { type: 'string', format: 'uuid' },
    sort_by: { type: 'string', enum: ['created_at', 'platform'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
};

export const createATSSchema = {
  type: 'object',
  required: ['company_id', 'platform', 'api_key'],
  properties: {
    company_id: { type: 'string', format: 'uuid' },
    platform: { type: 'string', minLength: 1 },
    api_key: { type: 'string', minLength: 1 },
    api_url: { type: 'string' },
    sync_enabled: { type: 'boolean' },
  },
  additionalProperties: false,
};

export const updateATSSchema = {
  type: 'object',
  properties: {
    sync_enabled: { type: 'boolean' },
    sync_roles: { type: 'boolean' },
    sync_candidates: { type: 'boolean' },
    sync_applications: { type: 'boolean' },
    sync_interviews: { type: 'boolean' },
  },
  additionalProperties: false,
};
