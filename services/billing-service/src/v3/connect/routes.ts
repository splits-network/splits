/**
 * Connect V3 Routes — Stripe Connect for individual recruiters
 *
 * Simplified: status, create, payouts, onboarding link only.
 * All identity/bank/TOS collection handled by Stripe's hosted onboarding.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events.js';
import { ConnectRepository } from './repository.js';
import { ConnectService } from './service.js';
import { onboardingLinkSchema, payoutsQuerySchema } from './types.js';

export function registerConnectRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new ConnectRepository(supabase);
  const service = new ConnectService(repository, supabase, eventPublisher);

  const basePath = '/api/v3/stripe/connect';

  // GET /account — get status
  app.get(`${basePath}/account`, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.getAccountStatus(clerkUserId);
    return reply.send({ data });
  });

  // POST /account — create or fetch
  app.post(`${basePath}/account`, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.getOrCreateAccount(clerkUserId);
    return reply.send({ data });
  });

  // GET /payouts
  app.get(`${basePath}/payouts`, {
    schema: { querystring: payoutsQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const query = request.query as { limit?: number };
    const data = await service.listPayouts(clerkUserId, query.limit || 10);
    return reply.send({ data });
  });

  // POST /onboarding-link
  app.post(`${basePath}/onboarding-link`, {
    schema: { body: onboardingLinkSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.createOnboardingLink(clerkUserId, request.body as any);
    return reply.send({ data });
  });
}
