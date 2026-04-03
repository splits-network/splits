/**
 * Presence V3 Routes
 *
 * Presence is a Redis-only resource with no database table.
 * No Core 5 CRUD routes -- only views.
 * Write path is handled by WebSocket presence.ping in chat-gateway.
 */

import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';
import { registerBatchStatusView } from './views/batch-status.route.js';

export function registerPresenceRoutes(app: FastifyInstance, redis: Redis) {
  // --- Views ---
  registerBatchStatusView(app, redis);

  // No Core CRUD -- presence has no database table.
  // No Actions -- writes are handled via WebSocket (chat-gateway).
}
