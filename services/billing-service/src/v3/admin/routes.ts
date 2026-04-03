/**
 * Admin Billing V3 Routes
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AdminBillingRepository } from './repository.js';
import { AdminBillingService } from './service.js';
import { AdminListParams, adminListQuerySchema, idParamSchema } from './types.js';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerAdminBillingRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new AdminBillingRepository(supabase);
  const service = new AdminBillingService(repository, supabase);

  app.get('/api/v3/admin/billing/payouts', { schema: { querystring: adminListQuerySchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.listPayouts(request.query as AdminListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  app.get('/api/v3/admin/billing/escrow', { schema: { querystring: adminListQuerySchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.listEscrowHolds(request.query as AdminListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  app.get('/api/v3/admin/billing/profiles', { schema: { querystring: adminListQuerySchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.listBillingProfiles(request.query as AdminListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  app.post('/api/v3/admin/billing/escrow/:id/release', { schema: { params: idParamSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.releaseEscrowHold(id, clerkUserId);
    return reply.send({ data });
  });

  app.get('/api/v3/admin/billing/counts', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const data = await service.getCounts(clerkUserId);
    return reply.send({ data });
  });
}
