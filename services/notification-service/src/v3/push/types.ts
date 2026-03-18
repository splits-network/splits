/**
 * Push Subscription V3 Types & JSON Schemas
 *
 * Table: push_subscriptions
 * Fields: user_id, endpoint, p256dh, auth, user_agent
 */

export interface PushSubscriptionInput {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
}

export interface PushSubscriptionRecord {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  created_at: string;
  last_used_at: string | null;
}

export interface PushPayload {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  renotify?: boolean;
  data?: {
    url?: string;
    notificationId?: string;
  };
}

// --- JSON Schemas ---

export const subscribeSchema = {
  type: 'object',
  required: ['endpoint', 'keys'],
  properties: {
    endpoint: { type: 'string', minLength: 1 },
    keys: {
      type: 'object',
      required: ['p256dh', 'auth'],
      properties: {
        p256dh: { type: 'string', minLength: 1 },
        auth: { type: 'string', minLength: 1 },
      },
      additionalProperties: false,
    },
    userAgent: { type: 'string' },
  },
  additionalProperties: false,
};

export const unsubscribeSchema = {
  type: 'object',
  required: ['endpoint'],
  properties: {
    endpoint: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
};
