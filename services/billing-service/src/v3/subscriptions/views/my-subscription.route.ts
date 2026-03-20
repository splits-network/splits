/**
 * GET /api/v3/subscriptions/views/my-subscription — current user's subscription with plan
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, NotFoundError } from '@splits-network/shared-fastify';
import { MySubscriptionRepository } from './my-subscription.repository';

export function registerMySubscriptionView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new MySubscriptionRepository(supabase);
  const accessResolver = new AccessContextResolver(supabase);

  app.get('/api/v3/subscriptions/views/my-subscription', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const context = await accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) throw new BadRequestError('Unable to resolve user');

    const subscription = await repository.findByUserId(context.identityUserId);
    if (!subscription) throw new NotFoundError('Subscription', `user:${context.identityUserId}`);

    return reply.send({ data: subscription });
  });
}
