/**
 * Plans V3 Routes — Core 5 CRUD
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { PlanRepository } from './repository';
import { PlanService } from './service';
import {
  CreatePlanInput,
  UpdatePlanInput,
  PlanListParams,
  listQuerySchema,
  createSchema,
  updateSchema,
  idParamSchema,
} from './types';

export function registerPlanRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new PlanRepository(supabase);
  const service = new PlanService(repository, supabase, eventPublisher);

  // GET /api/v3/public/plans — public listing (no auth, active plans only)
  app.get('/api/v3/public/plans', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const params: PlanListParams = { ...(request.query as PlanListParams), status: 'active' as const };
    const result = await service.getAll(params);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/plans — list
  app.get('/api/v3/plans', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as PlanListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/plans/:id — get by id
  app.get('/api/v3/plans/:id', {
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

  // POST /api/v3/plans — create
  app.post('/api/v3/plans', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreatePlanInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/plans/:id — update
  app.patch('/api/v3/plans/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdatePlanInput, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/plans/:id — archive
  app.delete('/api/v3/plans/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Plan archived successfully' } });
  });
}
