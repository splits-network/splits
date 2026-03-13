/**
 * Automation Executions V3 Types & JSON Schemas
 */

export interface ExecutionListParams {
  page?: number;
  limit?: number;
  rule_id?: string;
  status?: string;
  requires_approval?: boolean;
  entity_type?: string;
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
    rule_id: { type: 'string', format: 'uuid' },
    status: { type: 'string', enum: ['pending', 'approved', 'executed', 'failed', 'rejected'] },
    requires_approval: { type: 'boolean' },
    entity_type: { type: 'string' },
    sort_by: { type: 'string', enum: ['created_at', 'status'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
  additionalProperties: true,
};
