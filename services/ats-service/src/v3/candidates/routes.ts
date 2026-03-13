/**
 * Candidates V3 Routes — CRUD + dashboard + resume endpoints
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { CandidateRepository } from './repository';
import { CandidateService } from './service';
import {
  CreateCandidateInput,
  UpdateCandidateInput,
  CandidateListParams,
  listQuerySchema,
  createSchema,
  updateSchema,
  idParamSchema,
} from './types';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

function getClerkUserId(request: any): string | null {
  return (request.headers['x-clerk-user-id'] as string) || null;
}

export function registerCandidateRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new CandidateRepository(supabase);
  const service = new CandidateService(repository, supabase, eventPublisher);

  // --- Non-parameterized routes FIRST (before :id) ---

  // GET /api/v3/candidates/me — current user's candidate profile
  app.get('/api/v3/candidates/me', async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const data = await service.getByClerkId(clerkUserId);
    return reply.send({ data });
  });

  // --- Core 5 CRUD ---

  // GET /api/v3/candidates — list
  app.get('/api/v3/candidates', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.getAll(request.query as CandidateListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/candidates/:id — get by id
  app.get('/api/v3/candidates/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.getById(id, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/candidates — create
  app.post('/api/v3/candidates', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const data = await service.create(request.body as CreateCandidateInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/candidates/:id — update
  app.patch('/api/v3/candidates/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateCandidateInput, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/candidates/:id — soft delete (admin only)
  app.delete('/api/v3/candidates/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Candidate deleted successfully' } });
  });

  // --- Additional endpoints ---

  // GET /api/v3/candidates/:id/dashboard-stats
  app.get('/api/v3/candidates/:id/dashboard-stats', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.getDashboardStats(id, clerkUserId);
    return reply.send({ data });
  });

  // GET /api/v3/candidates/:id/recent-applications
  app.get('/api/v3/candidates/:id/recent-applications', {
    schema: {
      params: idParamSchema,
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 25, default: 5 },
        },
      },
    },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const { limit } = request.query as { limit?: number };
    const data = await service.getRecentApplications(id, limit || 5, clerkUserId);
    return reply.send({ data });
  });

  // GET /api/v3/candidates/:id/primary-resume
  app.get('/api/v3/candidates/:id/primary-resume', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.getPrimaryResume(id, clerkUserId);
    return reply.send({ data });
  });
}
