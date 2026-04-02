/**
 * Splits Rates V3 Routes
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events.js';
import { SplitsRateRepository } from './repository.js';
import { SplitsRateService } from './service.js';
import { SplitsRateUpdateInput, planIdParamSchema, updateSchema } from './types.js';

export function registerSplitsRateRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new SplitsRateRepository(supabase);
  const service = new SplitsRateService(repository, supabase, eventPublisher);

  // GET /api/v3/public/splits-rates — list all active rates (public, no auth required)
  app.get('/api/v3/public/splits-rates', async (request, reply) => {
    const data = await service.getActiveRates();
    return reply.send({ data });
  });

  // GET /api/v3/splits-rates/:planId — get active rate for a plan (public)
  app.get('/api/v3/splits-rates/:planId', {
    schema: { params: planIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { planId } = request.params as { planId: string };
    const data = await service.getActiveRateByPlanId(planId);
    return reply.send({ data });
  });

  // PATCH /api/v3/splits-rates/:planId — update rates (admin only)
  app.patch('/api/v3/splits-rates/:planId', {
    schema: { params: planIdParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { planId } = request.params as { planId: string };
    const data = await service.updateRate(planId, request.body as SplitsRateUpdateInput, clerkUserId);
    return reply.send({ data });
  });
}
