/**
 * Jobs V3 Routes — Core 5 CRUD + view/action registration
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { JobRepository } from './repository';
import { JobService } from './service';
import { CreateJobInput, UpdateJobInput, JobListParams,
  idParamSchema, listQuerySchema, createJobSchema, updateJobSchema } from './types';
import { registerRecruiterBoardView } from './views/recruiter-board.route';
import { registerCompanyBoardView } from './views/company-board.route';
import { registerCandidateListingView } from './views/candidate-listing.route';
import { registerAdminBoardView } from './views/admin-board.route';
import { registerTerminationImpactView } from './views/termination-impact.route';
import { registerRecruiterDetailView } from './views/recruiter-detail.route';
import { registerCompanyDetailView } from './views/company-detail.route';
import { registerCandidateDetailView } from './views/candidate-detail.route';
import { registerEditorView } from './views/editor.route';
import { registerProcessTerminationAction } from './actions/process-termination.route';

export function registerJobRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new JobRepository(supabase);
  const service = new JobService(repository, supabase, eventPublisher);

  // Register views (before :id routes to avoid collision)
  registerRecruiterBoardView(app, supabase);
  registerCompanyBoardView(app, supabase);
  registerCandidateListingView(app, supabase);
  registerAdminBoardView(app, supabase);
  registerTerminationImpactView(app, supabase);

  // Register single-resource views
  registerRecruiterDetailView(app, supabase);
  registerCompanyDetailView(app, supabase);
  registerCandidateDetailView(app, supabase);
  registerEditorView(app, supabase);

  // Register actions
  registerProcessTerminationAction(app, supabase, eventPublisher);

  // ── Core 5 CRUD ────────────────────────────────────────────────

  // GET /api/v3/jobs — list
  app.get('/api/v3/jobs', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as JobListParams, clerkUserId);
    reply.header('Cache-Control', 'private, max-age=30');
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/jobs/:id — read
  app.get('/api/v3/jobs/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const job = await service.getById(id);
    reply.header('Cache-Control', 'private, max-age=30');
    return reply.send({ data: job });
  });

  // POST /api/v3/jobs — create
  app.post('/api/v3/jobs', {
    schema: { body: createJobSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const job = await service.create(request.body as CreateJobInput, clerkUserId);
    return reply.code(201).send({ data: job });
  });

  // PATCH /api/v3/jobs/:id — update
  app.patch('/api/v3/jobs/:id', {
    schema: { params: idParamSchema, body: updateJobSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const job = await service.update(id, request.body as UpdateJobInput, clerkUserId);
    return reply.send({ data: job });
  });

  // DELETE /api/v3/jobs/:id — soft delete
  app.delete('/api/v3/jobs/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Job deleted successfully' } });
  });
}
