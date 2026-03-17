/**
 * Notification Preferences V3 Types & JSON Schemas
 *
 * Table: notification_preferences
 * Fields: user_id, category, email_enabled, in_app_enabled
 */

export interface PreferenceUpdateInput {
  email_enabled?: boolean;
  in_app_enabled?: boolean;
}

export interface BulkPreferenceUpdateInput {
  preferences: Array<{
    category: string;
    email_enabled: boolean;
    in_app_enabled: boolean;
  }>;
}

export interface EffectivePreference {
  category: string;
  label: string;
  description: string;
  icon: string;
  email_enabled: boolean;
  in_app_enabled: boolean;
  unsubscribable: boolean;
  email_entitled: boolean;
}

// --- JSON Schemas ---

export const listQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
  },
  additionalProperties: true,
};

export const categoryParamSchema = {
  type: 'object',
  required: ['category'],
  properties: {
    category: { type: 'string', minLength: 1 },
  },
};

export const updateSchema = {
  type: 'object',
  properties: {
    email_enabled: { type: 'boolean' },
    in_app_enabled: { type: 'boolean' },
  },
  additionalProperties: false,
};

export const bulkUpdateSchema = {
  type: 'object',
  required: ['preferences'],
  properties: {
    preferences: {
      type: 'array',
      items: {
        type: 'object',
        required: ['category', 'email_enabled', 'in_app_enabled'],
        properties: {
          category: { type: 'string', minLength: 1 },
          email_enabled: { type: 'boolean' },
          in_app_enabled: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
};
