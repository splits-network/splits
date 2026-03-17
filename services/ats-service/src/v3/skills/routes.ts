/**
 * Skills V3 Routes — List, Get, Create, Delete
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { SkillRepository } from './repository';
import { SkillService } from './service';
import { CreateSkillInput, SkillListParams, listQuerySchema, createSchema, idParamSchema } from './types';

export function registerSkillRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new SkillRepository(supabase);
  const service = new SkillService(repository, supabase);

  // GET /api/v3/skills — list/search
  app.get('/api/v3/skills', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as SkillListParams);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/skills/:id
  app.get('/api/v3/skills/:id', {
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

  // POST /api/v3/skills — create (find-or-create by slug)
  app.post('/api/v3/skills', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateSkillInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // DELETE /api/v3/skills/:id — admin only
  app.delete('/api/v3/skills/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Skill deleted successfully' } });
  });
}
