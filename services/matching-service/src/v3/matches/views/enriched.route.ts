/**
 * GET /api/v3/matches/views/enriched
 * Returns matches with joined candidate + job + company data
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { EnrichedMatchRepository } from './enriched.repository.js';
import { EnrichedMatchService } from './enriched.service.js';
import { listQuerySchema, MatchListParams } from '../types.js';

export function registerEnrichedMatchView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new EnrichedMatchRepository(supabase);
  const service = new EnrichedMatchService(repository, supabase);

  app.get('/api/v3/matches/views/enriched', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getEnriched(request.query as MatchListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });
}
