/**
 * Admin V3 Types & JSON Schemas
 */

export interface AdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: string;
  status?: string;
}

// --- JSON Schemas ---

export const adminListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    search: { type: 'string' },
    sort_by: { type: 'string', default: 'created_at' },
    sort_order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
    status: { type: 'string' },
  },
};

export const adminActivityQuerySchema = {
  type: 'object',
  properties: {
    scope: { type: 'string' },
    limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
  },
};

export const adminPeriodQuerySchema = {
  type: 'object',
  properties: {
    period: { type: 'string', default: '30d' },
  },
};

export const idParamSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
};
