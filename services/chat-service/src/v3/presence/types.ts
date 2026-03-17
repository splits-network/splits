/**
 * Presence V3 Types & JSON Schemas
 *
 * Presence is a Redis-only resource with no database table.
 * Data store: Redis keys `presence:user:{identityUserId}`
 * Write path: WebSocket presence.ping via chat-gateway
 * Read path: REST batch lookup via this V3 resource
 */

// --- Interfaces ---

export type PresenceStatusValue = 'online' | 'idle' | 'offline';

export interface PresenceEntry {
  userId: string;
  status: PresenceStatusValue;
  lastSeenAt: string | null;
}

export interface BatchStatusQuery {
  userIds: string | string[];
}

// --- JSON Schemas ---

export const batchStatusQuerySchema = {
  type: 'object',
  required: ['userIds'],
  properties: {
    userIds: {
      oneOf: [
        { type: 'string', minLength: 1 },
        { type: 'array', items: { type: 'string', minLength: 1 }, minItems: 1, maxItems: 100 },
      ],
    },
  },
};
