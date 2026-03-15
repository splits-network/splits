/**
 * Job Recommendations V3 Routes
 * Core 5 CRUD + detail view registration
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { JobRecommendationRepository } from './repository';
import { JobRecommendationService } from './service';
import { registerJobRecommendationDetailView } from './views/detail.route';
import {
  CreateJobRecommendationInput,
  UpdateJobRecommendationInput,
  JobRecommendationListParams,
  listQuerySchema,
  createSchema,
  updateSchema,
  idParamSchema,
} from './types';

export function registerJobRecommendationRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new JobRecommendationRepository(supabase);
  const service = new JobRecommendationService(repository, supabase, eventPublisher);

  // Register views and non-:id routes before :id to avoid route collision
  registerJobRecommendationDetailView(app, supabase);

  // GET /api/v3/job-recommendations/mine — candidate's pending/viewed recommendations
  app.get('/api/v3/job-recommendations/mine', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getForCandidate(clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // ── Core 5 CRUD ────────────────────────────────────────────────

  // GET /api/v3/job-recommendations — list with filters
  app.get('/api/v3/job-recommendations', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as JobRecommendationListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/job-recommendations/:id
  app.get('/api/v3/job-recommendations/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.getById(id);
    return reply.send({ data });
  });

  // POST /api/v3/job-recommendations — create (company user or admin)
  app.post('/api/v3/job-recommendations', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateJobRecommendationInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/job-recommendations/:id — update status (candidate or admin)
  app.patch('/api/v3/job-recommendations/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.updateStatus(id, request.body as UpdateJobRecommendationInput, clerkUserId);
    return reply.send({ data });
  });
}
