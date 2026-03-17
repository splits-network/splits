/**
 * Streaks V3 Routes — GET list, GET by id
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { StreakRepository } from './repository';
import { StreakService } from './service';
import { StreakListParams, idParamSchema, listQuerySchema } from './types';

export function registerStreakRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new StreakRepository(supabase);
  const service = new StreakService(repository, supabase);

  app.get('/api/v3/streaks', { schema: { querystring: listQuerySchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const result = await service.getAll(request.query as StreakListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  app.get('/api/v3/streaks/:id', { schema: { params: idParamSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const data = await service.getById((request.params as { id: string }).id, clerkUserId);
    return reply.send({ data });
  });
}
