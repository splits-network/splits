/**
 * Admin Notifications V3 Types & JSON Schemas
 *
 * Tables: site_notifications, notification_log (admin views)
 * Admin-only endpoints for managing site-wide notifications and viewing the log.
 */

export interface CreateSiteNotificationInput {
  type: string;
  severity: string;
  title: string;
  message?: string;
  starts_at?: string;
  expires_at?: string;
  is_active?: boolean;
  dismissible?: boolean;
}

export interface UpdateSiteNotificationInput {
  type?: string;
  severity?: string;
  title?: string;
  message?: string;
  starts_at?: string;
  expires_at?: string;
  is_active?: boolean;
  dismissible?: boolean;
}

export interface AdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  is_active?: string | boolean;
  severity?: string;
  status?: string;
  channel?: string;
}

// --- JSON Schemas ---

export const siteNotificationListSchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    search: { type: 'string' },
    sort_by: { type: 'string', enum: ['created_at', 'title', 'severity'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
    is_active: { type: 'string' },
    severity: { type: 'string' },
  },
};

export const notificationLogListSchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
    search: { type: 'string' },
    sort_by: { type: 'string', enum: ['created_at', 'sent_at', 'status'] },
    sort_order: { type: 'string', enum: ['asc', 'desc'] },
    status: { type: 'string', enum: ['pending', 'sent', 'failed'] },
    channel: { type: 'string', enum: ['email', 'in_app', 'both'] },
  },
};

export const createSiteNotificationSchema = {
  type: 'object',
  required: ['type', 'severity', 'title'],
  properties: {
    type: { type: 'string', minLength: 1, maxLength: 100 },
    severity: { type: 'string', minLength: 1, maxLength: 50 },
    title: { type: 'string', minLength: 1, maxLength: 500 },
    message: { type: 'string', maxLength: 2000 },
    starts_at: { type: 'string' },
    expires_at: { type: 'string' },
    is_active: { type: 'boolean' },
    dismissible: { type: 'boolean' },
  },
  additionalProperties: false,
};

export const updateSiteNotificationSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', maxLength: 100 },
    severity: { type: 'string', maxLength: 50 },
    title: { type: 'string', maxLength: 500 },
    message: { type: 'string', maxLength: 2000 },
    starts_at: { type: 'string' },
    expires_at: { type: 'string' },
    is_active: { type: 'boolean' },
    dismissible: { type: 'boolean' },
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
