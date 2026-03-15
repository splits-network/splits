/**
 * Webhooks V3 Types & JSON Schemas
 *
 * Re-exports V2 types — webhook contract is unchanged.
 */

export type {
  ClerkWebhookEvent,
  WebhookHeaders,
  ClerkUserData,
  WebhookSourceApp,
} from '../../v2/webhooks/types';

// --- JSON Schemas ---

export const webhookHeadersSchema = {
  type: 'object',
  properties: {
    'svix-id': { type: 'string' },
    'svix-timestamp': { type: 'string' },
    'svix-signature': { type: 'string' },
  },
  required: ['svix-id', 'svix-timestamp', 'svix-signature'],
};

export const webhookBodySchema = {
  type: 'object',
};
