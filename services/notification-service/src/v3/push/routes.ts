/**
 * Push Subscription V3 Routes
 *
 * VAPID key (public), subscribe, unsubscribe, list subscriptions.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { PushSubscriptionRepository } from './repository';
import { PushSubscriptionService } from './service';
import { PushSubscriptionInput, subscribeSchema, unsubscribeSchema } from './types';

export function registerPushRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
) {
  const repository = new PushSubscriptionRepository(supabase);
  const service = new PushSubscriptionService(repository, supabase);

  // GET /api/v3/public/push/vapid-key — public, no auth needed
  app.get('/api/v3/public/push/vapid-key', async (_request, reply) => {
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      return reply.status(503).send({
        error: { code: 'PUSH_NOT_CONFIGURED', message: 'Push notifications not configured' },
      });
    }
    return reply.send({ data: { vapidPublicKey } });
  });

  // POST /api/v3/push/subscriptions — register push subscription
  app.post('/api/v3/push/subscriptions', {
    schema: { body: subscribeSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
      });
    }
    const data = await service.subscribe(
      request.body as PushSubscriptionInput,
      clerkUserId,
    );
    return reply.status(201).send({ data });
  });

  // POST /api/v3/push/subscriptions/actions/unsubscribe — remove push subscription
  app.post('/api/v3/push/subscriptions/actions/unsubscribe', {
    schema: { body: unsubscribeSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
      });
    }
    const { endpoint } = request.body as { endpoint: string };
    await service.unsubscribe(endpoint, clerkUserId);
    return reply.status(204).send();
  });

  // GET /api/v3/push/subscriptions — list user's subscriptions
  app.get('/api/v3/push/subscriptions', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
      });
    }
    const data = await service.listSubscriptions(clerkUserId);
    return reply.send({ data });
  });
}
