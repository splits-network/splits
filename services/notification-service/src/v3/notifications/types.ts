/**
 * Notifications V3 Types & JSON Schemas
 *
 * Table: notification_log
 * Fields: event_type, recipient_email, recipient_user_id, subject, template,
 *         payload, channel, status, read, dismissed, action_url, action_label,
 *         priority, category, resend_message_id, error_message, sent_at
 */

export type NotificationChannel = 'email' | 'in_app' | 'both';
export type NotificationStatus = 'pending' | 'sent' | 'failed';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationListParams {
  page?: number;
  limit?: number;
  channel?: NotificationChannel;
  status?: NotificationStatus;
  category?: string;
  priority?: NotificationPriority;
  unread_only?: boolean;
  search?: string;
}

export interface NotificationUpdateInput {
  read?: boolean;
  read_at?: string | null;
  dismissed?: boolean;
  status?: NotificationStatus;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    channel: { type: 'string', enum: ['email', 'in_app', 'both'] },
    status: { type: 'string', enum: ['pending', 'sent', 'failed'] },
    category: { type: 'string' },
    priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'] },
    unread_only: { type: 'boolean' },
    search: { type: 'string' },
  },
  additionalProperties: true,
};

export const updateSchema = {
  type: 'object',
  properties: {
    read: { type: 'boolean' },
    read_at: { type: ['string', 'null'] },
    dismissed: { type: 'boolean' },
    status: { type: 'string', enum: ['pending', 'sent', 'failed'] },
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
