/**
 * Call Stats V3 Routes
 * GET /api/v3/calls/stats
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { StatsRepository } from './repository';
import { StatsService } from './service';
import { StatsQueryParams, statsQuerySchema } from './types';

export function registerStatsRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
) {
  const repository = new StatsRepository(supabase);
  const service = new StatsService(repository, supabase);

  // GET /api/v3/calls/stats
  app.get('/api/v3/calls/stats', {
    schema: { querystring: statsQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const query = request.query as StatsQueryParams;
    const data = await service.getStats(clerkUserId, query.entity_type, query.entity_id, request.headers);
    return reply.send({ data });
  });
}
