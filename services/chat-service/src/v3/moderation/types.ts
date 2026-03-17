/**
 * Moderation V3 Types & JSON Schemas
 *
 * Audit log: chat_moderation_audit table
 * Metrics: aggregation view across multiple chat tables
 *
 * Reports types are in v3/reports/types.ts (separate resource).
 */

// --- Audit log interfaces ---

export interface ChatModerationAudit {
  id: string;
  actor_user_id: string;
  target_user_id: string;
  action: 'warn' | 'mute_user' | 'suspend_messaging' | 'ban_user';
  details: Record<string, any> | null;
  created_at: string;
}

export interface AuditLogListParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// --- Metrics view response ---

export interface ModerationMetrics {
  rangeDays: number;
  since: string;
  totals: {
    messages: number;
    conversations: number;
    reports: number;
    blocks: number;
    attachments: number;
    attachments_blocked: number;
    redactions: number;
    moderation_actions: number;
  };
  requests: {
    pending: number;
    declined: number;
  };
  retention: {
    last_run_at: string | null;
    last_status: string | null;
    messages_redacted: number;
    attachments_deleted: number;
    audits_archived: number;
  };
}

// --- JSON Schemas ---

export const auditLogListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    sort_by: { type: 'string', enum: ['created_at'] },
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
};

export const metricsQuerySchema = {
  type: 'object',
  properties: {
    rangeDays: { type: 'integer', minimum: 1, maximum: 365, default: 7 },
  },
  additionalProperties: false,
};
