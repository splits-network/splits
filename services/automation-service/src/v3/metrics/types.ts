/**
 * Marketplace Metrics V3 Types & JSON Schemas
 */

export interface MetricListParams {
  page?: number;
  limit?: number;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const idParamSchema = { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } };

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    date_from: { type: 'string' },
    date_to: { type: 'string' },
    sort_by: { type: 'string', enum: ['metric_date', 'created_at'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
};
