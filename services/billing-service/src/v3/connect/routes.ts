/**
 * Connect V3 Routes — Stripe Connect for individual recruiters
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { ConnectRepository } from './repository';
import { ConnectService } from './service';
import {
  onboardingLinkSchema,
  updateAccountSchema,
  addBankAccountSchema,
  payoutsQuerySchema,
} from './types';

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

  // PATCH /account — update details
  app.patch(`${basePath}/account`, {
    schema: { body: updateAccountSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.updateAccountDetails(clerkUserId, request.body);
    return reply.send({ data });
  });

  // POST /bank-account — add bank account
  app.post(`${basePath}/bank-account`, {
    schema: { body: addBankAccountSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.addExternalAccount(clerkUserId, request.body as { token: string });
    return reply.send({ data });
  });

  // POST /accept-tos
  app.post(`${basePath}/accept-tos`, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const ip = request.ip || (request.headers['x-forwarded-for'] as string) || '0.0.0.0';
    const data = await service.acceptTermsOfService(clerkUserId, ip);
    return reply.send({ data });
  });

  // POST /verification-session
  app.post(`${basePath}/verification-session`, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.createVerificationSession(clerkUserId);
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
