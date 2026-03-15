/**
 * Payouts V3 Types — Interfaces & JSON Schemas
 */

export type PayoutRole =
  | 'candidate_recruiter'
  | 'company_recruiter'
  | 'job_owner'
  | 'candidate_sourcer'
  | 'company_sourcer';

export type TransactionStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'reversed' | 'on_hold';
export type TransactionType = 'member_payout' | 'firm_admin_take';

export interface TransactionListParams {
  page?: number;
  limit?: number;
  placement_id?: string;
  recruiter_id?: string;
  status?: TransactionStatus;
  transaction_type?: TransactionType;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const transactionListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100 },
    placement_id: { type: 'string' },
    recruiter_id: { type: 'string' },
    status: { type: 'string', enum: ['pending', 'processing', 'paid', 'failed', 'reversed', 'on_hold'] },
    transaction_type: { type: 'string', enum: ['member_payout', 'firm_admin_take'] },
    sort_by: { type: 'string' },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
  additionalProperties: false,
};

export const idParamSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export const placementIdParamSchema = {
  type: 'object',
  required: ['placementId'],
  properties: {
    placementId: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};
