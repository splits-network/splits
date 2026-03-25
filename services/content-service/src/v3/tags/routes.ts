/**
 * Content Tags V3 Routes — List, Get, Create, Delete
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { TagRepository } from './repository';
import { TagService } from './service';
import { CreateTagInput, TagListParams, listQuerySchema, createSchema, idParamSchema } from './types';

export function registerTagRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new TagRepository(supabase);
  const service = new TagService(repository, supabase);

  // GET /api/v3/public/content-tags — public list/search for filter UI
  app.get('/api/v3/public/content-tags', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const result = await service.getAll(request.query as TagListParams);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/content-tags — list/search (auth required, admin)
  app.get('/api/v3/content-tags', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const result = await service.getAll(request.query as TagListParams);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/content-tags/:id
  app.get('/api/v3/content-tags/:id', {
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

  // POST /api/v3/content-tags — create (find-or-create by slug)
  app.post('/api/v3/content-tags', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateTagInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // DELETE /api/v3/content-tags/:id — admin only
  app.delete('/api/v3/content-tags/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Content tag deleted successfully' } });
  });
}
