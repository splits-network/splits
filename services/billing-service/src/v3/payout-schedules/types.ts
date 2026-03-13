/**
 * Payout Schedules V3 Types — Interfaces & JSON Schemas
 */

export type PayoutScheduleStatus =
  | 'scheduled'
  | 'triggered'
  | 'cancelled'
  | 'pending'
  | 'processing'
  | 'processed'
  | 'failed';

export interface PayoutScheduleListParams {
  page?: number;
  limit?: number;
  status?: PayoutScheduleStatus;
  placement_id?: string;
  trigger_event?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreatePayoutScheduleInput {
  placement_id: string;
  payout_id?: string;
  scheduled_date: string;
  guarantee_completion_date?: string;
  trigger_event: string;
}

export interface UpdatePayoutScheduleInput {
  scheduled_date?: string;
  guarantee_completion_date?: string;
  status?: PayoutScheduleStatus;
  cancellation_reason?: string;
}

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100 },
    status: { type: 'string', enum: ['scheduled', 'triggered', 'cancelled', 'pending', 'processing', 'processed', 'failed'] },
    placement_id: { type: 'string' },
    trigger_event: { type: 'string' },
    date_from: { type: 'string' },
    date_to: { type: 'string' },
    sort_by: { type: 'string' },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['placement_id', 'scheduled_date', 'trigger_event'],
  properties: {
    placement_id: { type: 'string' },
    payout_id: { type: 'string' },
    scheduled_date: { type: 'string' },
    guarantee_completion_date: { type: 'string' },
    trigger_event: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    scheduled_date: { type: 'string' },
    guarantee_completion_date: { type: 'string' },
    status: { type: 'string', enum: ['scheduled', 'triggered', 'cancelled', 'pending', 'processing', 'processed', 'failed'] },
    cancellation_reason: { type: 'string' },
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
