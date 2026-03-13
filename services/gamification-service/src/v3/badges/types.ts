/**
 * Badges V3 Types & JSON Schemas
 */

export interface BadgeListParams {
  page?: number;
  limit?: number;
  entity_type?: string;
  entity_id?: string;
  include_revoked?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const idParamSchema = { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } };

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    entity_type: { type: 'string', enum: ['recruiter', 'candidate', 'company', 'firm'] },
    entity_id: { type: 'string', format: 'uuid' },
    include_revoked: { type: 'boolean' },
    sort_by: { type: 'string', enum: ['awarded_at', 'created_at'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
};
