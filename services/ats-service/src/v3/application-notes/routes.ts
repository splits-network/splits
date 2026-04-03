/**
 * Application Notes V3 Routes — Core 5 CRUD
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events.js';
import { ApplicationNoteRepository } from './repository.js';
import { ApplicationNoteService } from './service.js';
import { registerWithAuthorView } from './views/with-author.route.js';
import {
  CreateApplicationNoteInput,
  UpdateApplicationNoteInput,
  ApplicationNoteListParams,
  listQuerySchema,
  createSchema,
  updateSchema,
  idParamSchema,
} from './types.js';

export function registerApplicationNoteRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new ApplicationNoteRepository(supabase);
  const service = new ApplicationNoteService(repository, supabase, eventPublisher);

  // Register views before :id routes
  registerWithAuthorView(app, supabase, eventPublisher);

  // GET /api/v3/application-notes — list
  app.get('/api/v3/application-notes', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as ApplicationNoteListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/application-notes/:id — get by id
  app.get('/api/v3/application-notes/:id', {
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

  // POST /api/v3/application-notes — create
  app.post('/api/v3/application-notes', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateApplicationNoteInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/application-notes/:id — update
  app.patch('/api/v3/application-notes/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateApplicationNoteInput, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/application-notes/:id — delete
  app.delete('/api/v3/application-notes/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Application note deleted successfully' } });
  });
}
