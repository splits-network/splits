/**
 * Escrow Holds V3 Types — Interfaces & JSON Schemas
 */

export type EscrowHoldStatus = 'active' | 'released' | 'cancelled';

export interface EscrowHoldListParams {
  page?: number;
  limit?: number;
  status?: EscrowHoldStatus;
  placement_id?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreateEscrowHoldInput {
  placement_id: string;
  payout_id?: string;
  hold_amount: number;
  hold_reason: string;
  release_scheduled_date: string;
}

export interface UpdateEscrowHoldInput {
  hold_amount?: number;
  hold_reason?: string;
  release_scheduled_date?: string;
  status?: EscrowHoldStatus;
}

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100 },
    status: { type: 'string', enum: ['active', 'released', 'cancelled'] },
    placement_id: { type: 'string' },
    date_from: { type: 'string' },
    date_to: { type: 'string' },
    sort_by: { type: 'string' },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
  additionalProperties: true,
};

export const createSchema = {
  type: 'object',
  required: ['placement_id', 'hold_amount', 'hold_reason', 'release_scheduled_date'],
  properties: {
    placement_id: { type: 'string' },
    payout_id: { type: 'string' },
    hold_amount: { type: 'number', minimum: 0 },
    hold_reason: { type: 'string', minLength: 1 },
    release_scheduled_date: { type: 'string' },
  },
  additionalProperties: false,
};

export const updateSchema = {
  type: 'object',
  properties: {
    hold_amount: { type: 'number', minimum: 0 },
    hold_reason: { type: 'string' },
    release_scheduled_date: { type: 'string' },
    status: { type: 'string', enum: ['active', 'released', 'cancelled'] },
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
