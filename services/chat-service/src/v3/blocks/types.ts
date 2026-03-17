/**
 * Blocks V3 Types & JSON Schemas
 *
 * Table: chat_user_blocks
 * Columns: id, blocker_user_id, blocked_user_id, reason, created_at
 */

// --- Interfaces ---

export interface ChatUserBlock {
  id: string;
  blocker_user_id: string;
  blocked_user_id: string;
  reason: string | null;
  created_at: string;
}

export interface BlockListParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreateBlockInput {
  blocked_user_id: string;
  reason?: string | null;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    sort_by: { type: 'string', enum: ['created_at'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
  },
  additionalProperties: false,
};

export const createBlockSchema = {
  type: 'object',
  required: ['blocked_user_id'],
  properties: {
    blocked_user_id: { type: 'string', minLength: 1 },
    reason: { type: 'string', maxLength: 500 },
  },
  additionalProperties: false,
};

export const idParamSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', minLength: 1 },
  },
};
