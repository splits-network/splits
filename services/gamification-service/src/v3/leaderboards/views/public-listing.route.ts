/**
 * GET /api/v3/leaderboards/views/public-listing
 * GET /api/v3/leaderboards/views/public-listing/rank
 * GET /api/v3/leaderboards/:id/view/public-listing
 *
 * Public leaderboard view — no auth required.
 * Enriches entries with entity display names and avatars.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { PublicListingRepository } from './public-listing.repository.js';
import { PublicListingService } from './public-listing.service.js';
import { LeaderboardListParams, idParamSchema, listQuerySchema } from '../types.js';

export function registerPublicListingView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new PublicListingRepository(supabase);
  const service = new PublicListingService(repository);

  app.get('/api/v3/leaderboards/views/public-listing', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const result = await service.getAll(request.query as LeaderboardListParams);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  app.get('/api/v3/leaderboards/views/public-listing/rank', async (request, reply) => {
    const query = request.query as any;
    if (!query.entity_type || !query.entity_id || !query.period || !query.metric) {
      return reply.status(400).send({
        error: { code: 'BAD_REQUEST', message: 'entity_type, entity_id, period, and metric are required' },
      });
    }
    const data = await service.getEntityRank(
      query.entity_type, query.entity_id, query.period, query.metric
    );
    return reply.send({ data });
  });

  app.get('/api/v3/leaderboards/:id/view/public-listing', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const data = await service.getById((request.params as { id: string }).id);
    return reply.send({ data });
  });
}
