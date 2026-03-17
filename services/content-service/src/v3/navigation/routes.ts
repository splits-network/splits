/**
 * Navigation V3 Routes — list, get, upsert (POST), delete
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { NavigationRepository } from './repository';
import { NavigationService } from './service';
import {
  NavigationListParams,
  UpsertNavigationInput,
  listQuerySchema,
  upsertSchema,
  idParamSchema,
} from './types';

export function registerNavigationRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
) {
  const repository = new NavigationRepository(supabase);
  const service = new NavigationService(repository, supabase);

  // GET /api/v3/navigation — list (public)
  app.get('/api/v3/navigation', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const result = await service.getAll(request.query as NavigationListParams);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/navigation/:id
  app.get('/api/v3/navigation/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = await service.getById(id);
    return reply.send({ data });
  });

  // POST /api/v3/navigation — upsert (admin only)
  app.post('/api/v3/navigation', {
    schema: { body: upsertSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.upsert(request.body as UpsertNavigationInput, clerkUserId, request.headers);
    return reply.code(201).send({ data });
  });

  // DELETE /api/v3/navigation/:id — admin only
  app.delete('/api/v3/navigation/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId, request.headers);
    return reply.send({ data: { message: 'Navigation deleted successfully' } });
  });
}
