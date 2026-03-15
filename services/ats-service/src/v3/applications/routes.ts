/**
 * Applications V3 Routes — Core 5 CRUD + action registration
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { ApplicationRepository } from './repository';
import { ApplicationService } from './service';
import {
  ApplicationListParams, CreateApplicationInput, UpdateApplicationInput,
  listQuerySchema, createSchema, updateSchema, idParamSchema,
} from './types';

// Action services
import { ProposalService } from './actions/proposal.service';
import { HireService } from './actions/hire.service';
import { AIReviewService } from './actions/ai-review.service';
import { PrescreenService } from './actions/prescreen.service';
import { TerminationService } from './actions/termination.service';

// View routes
import { registerApplicationDetailView } from './views/detail.route';

// Action routes
import { registerProposalRoutes } from './actions/proposal.route';
import { registerHireRoutes } from './actions/hire.route';
import { registerAIReviewRoutes } from './actions/ai-review.route';
import { registerPrescreenRoutes } from './actions/prescreen.route';
import { registerTerminationRoutes } from './actions/termination.route';

export function registerApplicationRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new ApplicationRepository(supabase);
  const service = new ApplicationService(repository, supabase, eventPublisher);

  // Instantiate action services
  const proposalService = new ProposalService(repository, supabase, eventPublisher);
  const hireService = new HireService(repository, supabase, eventPublisher);
  const aiReviewService = new AIReviewService(repository, supabase, eventPublisher);
  const prescreenService = new PrescreenService(repository, supabase, eventPublisher);
  const terminationService = new TerminationService(repository);

  // Register view routes BEFORE core CRUD (to avoid :id collision)
  registerApplicationDetailView(app, supabase);

  // Register action routes BEFORE core CRUD (non-parameterized first)
  registerTerminationRoutes(app, terminationService);
  registerProposalRoutes(app, proposalService);
  registerHireRoutes(app, hireService, supabase, eventPublisher);
  registerAIReviewRoutes(app, aiReviewService);
  registerPrescreenRoutes(app, prescreenService);

  // ── Core 5 CRUD ────────────────────────────────────────────────

  // GET /api/v3/applications — list
  app.get('/api/v3/applications', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as ApplicationListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/applications/:id — read (flat, no joins)
  app.get('/api/v3/applications/:id', {
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

  // POST /api/v3/applications — create
  app.post('/api/v3/applications', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateApplicationInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/applications/:id — update
  app.patch('/api/v3/applications/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateApplicationInput, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/applications/:id — soft delete
  app.delete('/api/v3/applications/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Application deleted successfully' } });
  });
}
