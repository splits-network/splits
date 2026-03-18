/**
 * Assignments V3 Routes — CRUD endpoints
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { AssignmentRepository } from './repository';
import { AssignmentService } from './service';
import { registerAssignmentListView } from './views/list.route';
import { registerAssignmentDetailView } from './views/detail.route';
import {
  AssignmentListParams, AssignmentUpdate, CreateAssignmentInput,
  listQuerySchema, createSchema, updateSchema, idParamSchema,
} from './types';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

function getClerkUserId(request: any): string | null {
  return (request.headers['x-clerk-user-id'] as string) || null;
}

export function registerAssignmentRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new AssignmentRepository(supabase);
  const service = new AssignmentService(repository, supabase, eventPublisher);

  // --- Views (before :id to avoid collision) ---
  registerAssignmentListView(app, supabase);
  registerAssignmentDetailView(app, supabase);

  // GET /api/v3/assignments — list
  app.get('/api/v3/assignments', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.getAll(request.query as AssignmentListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/assignments/:id
  app.get('/api/v3/assignments/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.getById(id, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/assignments — create
  app.post('/api/v3/assignments', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const data = await service.create(request.body as CreateAssignmentInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/assignments/:id
  app.patch('/api/v3/assignments/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as AssignmentUpdate, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/assignments/:id
  app.delete('/api/v3/assignments/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Assignment deleted successfully' } });
  });
}
