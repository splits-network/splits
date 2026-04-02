/**
 * Reputation V3 Routes — CRUD endpoints
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events.js';
import { ReputationRepository } from './repository.js';
import { ReputationService } from './service.js';
import { registerReputationListView } from './views/list.route.js';
import { ReputationListParams, ReputationUpdate, listQuerySchema, createSchema, updateSchema, idParamSchema } from './types.js';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

function getClerkUserId(request: any): string | null {
  return (request.headers['x-clerk-user-id'] as string) || null;
}

export function registerReputationRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new ReputationRepository(supabase);
  const service = new ReputationService(repository, supabase, eventPublisher);

  // --- Views (before :id to avoid collision) ---
  registerReputationListView(app, supabase);

  // GET /api/v3/reputation — list
  app.get('/api/v3/reputation', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.getAll(request.query as ReputationListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/reputation/:id — get by id
  app.get('/api/v3/reputation/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.getById(id, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/reputation — create
  app.post('/api/v3/reputation', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const data = await service.create(request.body as any, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/reputation/:id — update
  app.patch('/api/v3/reputation/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as ReputationUpdate, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/reputation/:id — delete
  app.delete('/api/v3/reputation/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Reputation record deleted successfully' } });
  });
}
