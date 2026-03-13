/**
 * Connections V3 Types & JSON Schemas
 */

export interface ConnectionListParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface InitiateConnectionInput {
  provider_slug: string;
  redirect_uri: string;
  organization_id?: string;
}

export interface CallbackInput {
  code: string;
  state: string;
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
    sort_by: { type: 'string', enum: ['created_at'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
};

export const initiateSchema = {
  type: 'object',
  required: ['provider_slug', 'redirect_uri'],
  properties: {
    provider_slug: { type: 'string', minLength: 1 },
    redirect_uri: { type: 'string', minLength: 1 },
    organization_id: { type: 'string' },
  },
  additionalProperties: false,
};

export const callbackSchema = {
  type: 'object',
  required: ['code', 'state'],
  properties: {
    code: { type: 'string', minLength: 1 },
    state: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
};
