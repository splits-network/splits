/**
 * Payout Audit V3 Types
 */

export interface AuditListParams {
  page?: number;
  limit?: number;
  placement_id?: string;
  schedule_id?: string;
  transaction_id?: string;
  event_type?: string;
  action?: string;
  changed_by?: string;
  date_from?: string;
  date_to?: string;
}

export const auditListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    placement_id: { type: 'string' },
    schedule_id: { type: 'string' },
    transaction_id: { type: 'string' },
    event_type: { type: 'string' },
    action: { type: 'string' },
    changed_by: { type: 'string' },
    date_from: { type: 'string' },
    date_to: { type: 'string' },
  },
};

export const placementIdParamSchema = {
  type: 'object',
  required: ['placementId'],
  properties: { placementId: { type: 'string', format: 'uuid' } },
};
