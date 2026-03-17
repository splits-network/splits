/**
 * Saved Jobs V3 Routes — GET, GET/:id, POST, DELETE (4 routes) + enriched view
 * No PATCH — saved jobs have no editable fields
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { SavedJobRepository } from './repository';
import { SavedJobService } from './service';
import { CreateSavedJobInput, SavedJobListParams,
  idParamSchema, listQuerySchema, createSchema } from './types';
import { registerEnrichedView } from './views/enriched.route';

export function registerSavedJobRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new SavedJobRepository(supabase);
  const service = new SavedJobService(repository, supabase, eventPublisher);

  // Register views before :id routes
  registerEnrichedView(app, supabase);

  // GET /api/v3/saved-jobs
  app.get('/api/v3/saved-jobs', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as SavedJobListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/saved-jobs/:id
  app.get('/api/v3/saved-jobs/:id', {
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

  // POST /api/v3/saved-jobs — idempotent
  app.post('/api/v3/saved-jobs', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateSavedJobInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // DELETE /api/v3/saved-jobs/:id
  app.delete('/api/v3/saved-jobs/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Saved job removed successfully' } });
  });
}
