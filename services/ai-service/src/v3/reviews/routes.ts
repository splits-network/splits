/**
 * AI Reviews V3 Routes — GET list, GET by id, POST create
 * No PATCH/DELETE — reviews are immutable once created
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import type { IAiClient } from '@splits-network/shared-ai-client';
import { IEventPublisher } from '../../v2/shared/events.js';
import { AIReviewRepository } from './repository.js';
import { AIReviewService } from './service.js';
import {
  CreateReviewInput, AIReviewListParams,
  idParamSchema, listQuerySchema, createReviewSchema,
} from './types.js';
import { registerJobStatsViewRoute } from './views/job-stats.route.js';
import { registerAnalyzeActionRoute } from './actions/analyze.route.js';
import { registerGenerateResumeActionRoute } from './actions/generate-resume.route.js';

export function registerReviewRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
  aiClient?: IAiClient,
) {
  const repository = new AIReviewRepository(supabase);
  const service = new AIReviewService(repository, supabase, eventPublisher);

  // Register views and actions BEFORE parameterized routes to avoid collisions
  registerJobStatsViewRoute(app, supabase);
  registerAnalyzeActionRoute(app, supabase, eventPublisher);
  registerGenerateResumeActionRoute(app, supabase, aiClient);

  // GET /api/v3/ai-reviews
  app.get('/api/v3/ai-reviews', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as AIReviewListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/ai-reviews/:id
  app.get('/api/v3/ai-reviews/:id', {
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

  // POST /api/v3/ai-reviews
  app.post('/api/v3/ai-reviews', {
    schema: { body: createReviewSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateReviewInput, clerkUserId);
    return reply.code(201).send({ data });
  });
}
