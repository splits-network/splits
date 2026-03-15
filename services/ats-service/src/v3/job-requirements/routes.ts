/**
 * Job Requirements V3 Routes — Core 5 CRUD + bulk-replace action
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { JobRequirementRepository } from './repository';
import { JobRequirementService } from './service';
import { CreateJobRequirementInput, UpdateJobRequirementInput, JobRequirementListParams,
  idParamSchema, listQuerySchema, createSchema, updateSchema } from './types';
import { registerBulkReplaceAction } from './actions/bulk-replace.route';

export function registerJobRequirementRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient
) {
  const repository = new JobRequirementRepository(supabase);
  const service = new JobRequirementService(repository);

  // Register actions before :id routes
  registerBulkReplaceAction(app, supabase);

  // GET /api/v3/job-requirements — list (requires job_id)
  app.get('/api/v3/job-requirements', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as JobRequirementListParams);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/job-requirements/:id
  app.get('/api/v3/job-requirements/:id', {
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

  // POST /api/v3/job-requirements
  app.post('/api/v3/job-requirements', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateJobRequirementInput);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/job-requirements/:id
  app.patch('/api/v3/job-requirements/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateJobRequirementInput);
    return reply.send({ data });
  });

  // DELETE /api/v3/job-requirements/:id
  app.delete('/api/v3/job-requirements/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id);
    return reply.send({ data: { message: 'Job requirement deleted successfully' } });
  });
}
