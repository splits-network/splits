/**
 * Pre-Screen V3 Routes — Core CRUD + answer retrieval
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { PreScreenRepository } from './repository';
import { PreScreenService } from './service';
import {
  CreatePreScreenInput,
  UpdatePreScreenInput,
  PreScreenListParams,
  listQuerySchema,
  createSchema,
  updateSchema,
  jobIdParamSchema,
  applicationIdParamSchema,
} from './types';

export function registerPreScreenRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new PreScreenRepository(supabase);
  const service = new PreScreenService(repository, supabase, eventPublisher);

  // --- Non-parameterized routes first ---

  // GET /api/v3/pre-screen — list jobs with pre-screen questions
  app.get('/api/v3/pre-screen', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as PreScreenListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/pre-screen/answers/:applicationId — get answers for an application
  app.get('/api/v3/pre-screen/answers/:applicationId', {
    schema: { params: applicationIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { applicationId } = request.params as { applicationId: string };
    const data = await service.getAnswers(applicationId, clerkUserId);
    return reply.send({ data });
  });

  // --- Core CRUD (keyed by jobId) ---

  // GET /api/v3/pre-screen/:jobId — get questions for a job
  app.get('/api/v3/pre-screen/:jobId', {
    schema: { params: jobIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { jobId } = request.params as { jobId: string };
    const data = await service.getByJobId(jobId, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/pre-screen — create questions for a job
  app.post('/api/v3/pre-screen', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreatePreScreenInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/pre-screen/:jobId — update questions for a job
  app.patch('/api/v3/pre-screen/:jobId', {
    schema: { params: jobIdParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { jobId } = request.params as { jobId: string };
    const data = await service.update(jobId, request.body as UpdatePreScreenInput, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/pre-screen/:jobId — clear questions from a job
  app.delete('/api/v3/pre-screen/:jobId', {
    schema: { params: jobIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { jobId } = request.params as { jobId: string };
    await service.delete(jobId, clerkUserId);
    return reply.send({ data: { message: 'Pre-screen questions cleared successfully' } });
  });
}
