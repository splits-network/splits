/**
 * Firm Connect V3 Routes
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { FirmConnectRepository } from './repository';
import { FirmConnectService } from './service';
import {
  onboardingLinkSchema,
  updateFirmAccountSchema,
  addBankAccountSchema,
  firmIdParamSchema,
  payoutsQuerySchema,
} from './types';

export function registerFirmConnectRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new FirmConnectRepository(supabase);
  const service = new FirmConnectService(repository, supabase, eventPublisher);

  const basePath = '/api/v3/stripe/firm-connect';

  // GET /:firmId/account
  app.get(`${basePath}/:firmId/account`, {
    schema: { params: firmIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const { firmId } = request.params as { firmId: string };
    const data = await service.getAccountStatus(clerkUserId, firmId);
    return reply.send({ data });
  });

  // POST /:firmId/account
  app.post(`${basePath}/:firmId/account`, {
    schema: { params: firmIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const { firmId } = request.params as { firmId: string };
    const data = await service.getOrCreateAccount(clerkUserId, firmId);
    return reply.send({ data });
  });

  // PATCH /:firmId/account
  app.patch(`${basePath}/:firmId/account`, {
    schema: { params: firmIdParamSchema, body: updateFirmAccountSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const { firmId } = request.params as { firmId: string };
    const data = await service.updateAccountDetails(clerkUserId, firmId, request.body);
    return reply.send({ data });
  });

  // POST /:firmId/bank-account
  app.post(`${basePath}/:firmId/bank-account`, {
    schema: { params: firmIdParamSchema, body: addBankAccountSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const { firmId } = request.params as { firmId: string };
    const data = await service.addBankAccount(clerkUserId, firmId, (request.body as any).token);
    return reply.send({ data });
  });

  // POST /:firmId/accept-tos
  app.post(`${basePath}/:firmId/accept-tos`, {
    schema: { params: firmIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const { firmId } = request.params as { firmId: string };
    const ip = request.ip || (request.headers['x-forwarded-for'] as string) || '0.0.0.0';
    const data = await service.acceptTos(clerkUserId, firmId, ip);
    return reply.send({ data });
  });

  // POST /:firmId/verification-session
  app.post(`${basePath}/:firmId/verification-session`, {
    schema: { params: firmIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const { firmId } = request.params as { firmId: string };
    const data = await service.createVerificationSession(clerkUserId, firmId);
    return reply.send({ data });
  });

  // GET /:firmId/payouts
  app.get(`${basePath}/:firmId/payouts`, {
    schema: { params: firmIdParamSchema, querystring: payoutsQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const { firmId } = request.params as { firmId: string };
    const query = request.query as { limit?: number };
    const data = await service.listPayouts(clerkUserId, firmId, query.limit || 10);
    return reply.send({ data });
  });

  // POST /:firmId/onboarding-link
  app.post(`${basePath}/:firmId/onboarding-link`, {
    schema: { params: firmIdParamSchema, body: onboardingLinkSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const { firmId } = request.params as { firmId: string };
    const data = await service.createOnboardingLink(clerkUserId, firmId, request.body as any);
    return reply.send({ data });
  });
}
