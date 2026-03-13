/**
 * Webhooks V3 Routes - Health check only
 *
 * Actual Stripe webhook endpoint stays in V2 (signature verification + complex processing).
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { WebhookRepository } from './repository';
import { WebhookService } from './service';

export function registerWebhookRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new WebhookRepository(supabase);
  const service = new WebhookService(repository, supabase);

  app.get('/api/v3/billing-webhooks/health', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const data = await service.getHealth();
    return reply.send({ data });
  });
}
