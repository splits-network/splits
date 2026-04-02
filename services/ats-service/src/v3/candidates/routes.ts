/**
 * Candidates V3 Routes — Core CRUD
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events.js';
import { CandidateRepository } from './repository.js';
import { CandidateService } from './service.js';
import {
  CreateCandidateInput,
  UpdateCandidateInput,
  CandidateListParams,
  listQuerySchema,
  createSchema,
  updateSchema,
  idParamSchema,
} from './types.js';
import { registerCandidateDetailView } from './views/detail.route.js';
import { registerCandidateEnrichedView } from './views/enriched.route.js';
import { registerCandidateDashboardStatsView } from './views/dashboard-stats.route.js';
import { registerCandidateRecentApplicationsView } from './views/recent-applications.route.js';
import { registerCandidatePrimaryResumeView } from './views/primary-resume.route.js';

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

  // --- Views ---
  registerCandidateEnrichedView(app, supabase);
  registerCandidateDetailView(app, supabase);
  registerCandidateDashboardStatsView(app, supabase);
  registerCandidateRecentApplicationsView(app, supabase);
  registerCandidatePrimaryResumeView(app, supabase);

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

  // POST /api/v3/candidates — create (returns existing candidate if email matches)
  app.post('/api/v3/candidates', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.create(request.body as CreateCandidateInput, clerkUserId);
    const status = result.meta.existing ? 200 : 201;
    return reply.code(status).send({ data: result.candidate, meta: result.meta });
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

}
