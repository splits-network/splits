/**
 * Discounts V3 Routes
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events.js';
import { DiscountRepository } from './repository.js';
import { PlanRepository } from '../plans/repository.js';
import { DiscountService } from './service.js';
import {
  DiscountValidationRequest,
  validateSchema,
  subscriptionIdParamSchema,
} from './types.js';

export function registerDiscountRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new DiscountRepository(supabase);
  const planRepository = new PlanRepository(supabase);
  const service = new DiscountService(repository, planRepository, supabase, eventPublisher);

  // POST /api/v3/discounts/validate — validate a promotion code
  app.post('/api/v3/discounts/validate', {
    schema: { body: validateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.validateDiscount(request.body as DiscountValidationRequest, clerkUserId);
    return reply.send({ data });
  });

  // GET /api/v3/subscriptions/:id/discount — get discount for subscription
  app.get('/api/v3/subscriptions/:id/discount', {
    schema: { params: subscriptionIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.getSubscriptionDiscount(id, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/subscriptions/:id/discount — remove discount
  app.delete('/api/v3/subscriptions/:id/discount', {
    schema: { params: subscriptionIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.removeSubscriptionDiscount(id, clerkUserId);
    return reply.send({ data: { message: 'Discount removed successfully' } });
  });
}
