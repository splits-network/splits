/**
 * Leaderboards V3 Routes — GET list, GET rank, GET by id
 *
 * Leaderboards are public data (displayed on marketplace pages).
 * Auth is optional — unauthenticated users see the same data.
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
    const clerkUserId = request.headers['x-clerk-user-id'] as string | undefined;
    const result = await service.getAll(request.query as LeaderboardListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  app.get('/api/v3/leaderboards/rank', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string | undefined;
    const query = request.query as any;
    if (!query.entity_type || !query.entity_id || !query.period || !query.metric) {
      return reply.status(400).send({ error: { code: 'BAD_REQUEST', message: 'entity_type, entity_id, period, and metric are required' } });
    }
    const data = await service.getEntityRank(query.entity_type, query.entity_id, query.period, query.metric, clerkUserId);
    return reply.send({ data });
  });

  app.get('/api/v3/leaderboards/:id', { schema: { params: idParamSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string | undefined;
    const data = await service.getById((request.params as { id: string }).id, clerkUserId);
    return reply.send({ data });
  });
}
