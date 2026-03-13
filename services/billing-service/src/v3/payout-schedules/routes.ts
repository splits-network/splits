/**
 * Payout Schedules V3 Routes
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { PayoutScheduleRepository } from './repository';
import { PayoutScheduleService } from './service';
import {
  CreatePayoutScheduleInput,
  UpdatePayoutScheduleInput,
  PayoutScheduleListParams,
  listQuerySchema,
  createSchema,
  updateSchema,
  idParamSchema,
} from './types';

export function registerPayoutScheduleRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new PayoutScheduleRepository(supabase);
  const service = new PayoutScheduleService(repository, supabase, eventPublisher);

  // GET /api/v3/payout-schedules — list
  app.get('/api/v3/payout-schedules', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as PayoutScheduleListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/payout-schedules/:id
  app.get('/api/v3/payout-schedules/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.getById(id, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/payout-schedules — create
  app.post('/api/v3/payout-schedules', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreatePayoutScheduleInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/payout-schedules/:id — update
  app.patch('/api/v3/payout-schedules/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdatePayoutScheduleInput, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/payout-schedules/:id — soft delete
  app.delete('/api/v3/payout-schedules/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Payout schedule deleted successfully' } });
  });

  // POST /api/v3/payout-schedules/:id/trigger — manual trigger
  app.post('/api/v3/payout-schedules/:id/trigger', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.trigger(id, clerkUserId);
    return reply.send({ data });
  });
}
