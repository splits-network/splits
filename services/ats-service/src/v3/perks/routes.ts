/**
 * Perks V3 Routes — List, Get, Create, Delete
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { PerkRepository } from './repository';
import { PerkService } from './service';
import { CreatePerkInput, PerkListParams, listQuerySchema, createSchema, idParamSchema } from './types';

export function registerPerkRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new PerkRepository(supabase);
  const service = new PerkService(repository, supabase);

  // GET /api/v3/perks — list/search
  app.get('/api/v3/perks', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as PerkListParams);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/perks/:id
  app.get('/api/v3/perks/:id', {
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

  // POST /api/v3/perks — create (find-or-create by slug)
  app.post('/api/v3/perks', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreatePerkInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // DELETE /api/v3/perks/:id — admin only
  app.delete('/api/v3/perks/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Perk deleted successfully' } });
  });
}
