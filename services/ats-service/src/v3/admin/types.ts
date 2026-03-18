/**
 * Admin V3 Types — Query schemas for admin views
 */

export interface AdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  [key: string]: any;
}

export const adminListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'number', minimum: 1, default: 1 },
    limit: { type: 'number', minimum: 1, maximum: 100, default: 25 },
    search: { type: 'string' },
    sort_by: { type: 'string' },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
} as const;

export const adminJobsQuerySchema = {
  type: 'object',
  properties: {
    ...adminListQuerySchema.properties,
    status: { type: 'string' },
    commute_type: { type: 'string' },
    job_level: { type: 'string' },
  },
} as const;

export const adminApplicationsQuerySchema = {
  type: 'object',
  properties: {
    ...adminListQuerySchema.properties,
    stage: { type: 'string' },
  },
} as const;

export const adminPlacementsQuerySchema = {
  type: 'object',
  properties: {
    ...adminListQuerySchema.properties,
    state: { type: 'string' },
  },
} as const;

export const periodQuerySchema = {
  type: 'object',
  properties: {
    period: { type: 'string', default: '30d' },
  },
} as const;

export const idParamSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
} as const;
