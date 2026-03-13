/**
 * Leaderboards V3 Routes — GET list, GET by id
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { LeaderboardRepository } from './repository';
import { LeaderboardService } from './service';
import { LeaderboardListParams, idParamSchema, listQuerySchema } from './types';

export function registerLeaderboardRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new LeaderboardRepository(supabase);
  const service = new LeaderboardService(repository, supabase);

  app.get('/api/v3/leaderboards', { schema: { querystring: listQuerySchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const result = await service.getAll(request.query as LeaderboardListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  app.get('/api/v3/leaderboards/:id', { schema: { params: idParamSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const data = await service.getById((request.params as { id: string }).id, clerkUserId);
    return reply.send({ data });
  });
}
