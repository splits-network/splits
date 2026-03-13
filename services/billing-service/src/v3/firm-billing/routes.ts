/**
 * Firm Billing V3 Routes
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { FirmBillingRepository } from './repository';
import { FirmBillingService } from './service';
import { firmIdParamSchema, createSchema, updateSchema, setupIntentSchema, updatePaymentMethodSchema } from './types';

export function registerFirmBillingRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new FirmBillingRepository(supabase);
  const service = new FirmBillingService(repository, supabase, eventPublisher);

  const basePath = '/api/v3/firm-billing-profiles';

  // GET /:firmId
  app.get(`${basePath}/:firmId`, { schema: { params: firmIdParamSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const { firmId } = request.params as { firmId: string };
    const data = await service.getProfile(firmId, clerkUserId);
    return reply.send({ data });
  });

  // POST /:firmId
  app.post(`${basePath}/:firmId`, { schema: { params: firmIdParamSchema, body: createSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const { firmId } = request.params as { firmId: string };
    const data = await service.createProfile(firmId, request.body, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /:firmId
  app.patch(`${basePath}/:firmId`, { schema: { params: firmIdParamSchema, body: updateSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const { firmId } = request.params as { firmId: string };
    const data = await service.updateProfile(firmId, request.body, clerkUserId);
    return reply.send({ data });
  });

  // POST /:firmId/setup-intent
  app.post(`${basePath}/:firmId/setup-intent`, { schema: { params: firmIdParamSchema, body: setupIntentSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const { firmId } = request.params as { firmId: string };
    const data = await service.createSetupIntent(firmId, clerkUserId);
    return reply.send({ data });
  });

  // POST /:firmId/payment-method
  app.post(`${basePath}/:firmId/payment-method`, { schema: { params: firmIdParamSchema, body: updatePaymentMethodSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const { firmId } = request.params as { firmId: string };
    const { payment_method_id } = request.body as { payment_method_id: string };
    const data = await service.updatePaymentMethod(firmId, payment_method_id, clerkUserId);
    return reply.send({ data });
  });

  // GET /:firmId/readiness
  app.get(`${basePath}/:firmId/readiness`, { schema: { params: firmIdParamSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const { firmId } = request.params as { firmId: string };
    const data = await service.getReadiness(firmId, clerkUserId);
    return reply.send({ data });
  });
}
