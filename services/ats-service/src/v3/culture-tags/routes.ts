/**
 * Culture Tags V3 Routes — List, Get, Create, Delete
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CultureTagRepository } from './repository';
import { CultureTagService } from './service';
import { CreateCultureTagInput, CultureTagListParams, listQuerySchema, createSchema, idParamSchema } from './types';

export function registerCultureTagRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new CultureTagRepository(supabase);
  const service = new CultureTagService(repository, supabase);

  // GET /api/v3/culture-tags — list/search
  app.get('/api/v3/culture-tags', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as CultureTagListParams);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/culture-tags/:id
  app.get('/api/v3/culture-tags/:id', {
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

  // POST /api/v3/culture-tags — create (find-or-create by slug)
  app.post('/api/v3/culture-tags', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateCultureTagInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // DELETE /api/v3/culture-tags/:id — admin only
  app.delete('/api/v3/culture-tags/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Culture tag deleted successfully' } });
  });
}
