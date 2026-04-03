/**
 * Webhook Events V3 Routes - Admin listing
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { WebhookEventRepository } from './repository.js';
import { WebhookEventService } from './service.js';
import { listQuerySchema } from './types.js';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerWebhookEventRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new WebhookEventRepository(supabase);
  const service = new WebhookEventService(repository, supabase);

  app.get('/api/v3/webhook-events', { schema: { querystring: listQuerySchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.list(request.query as any, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });
}
