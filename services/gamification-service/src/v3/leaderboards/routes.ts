/**
 * Leaderboards V3 Routes
 *
 * Leaderboards are public data with enrichment — served as views.
 * Legacy paths (/api/v3/leaderboards) kept for backward compatibility,
 * new view paths follow V3 view conventions.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { registerPublicListingView } from './views/public-listing.route.js';
import { PublicListingRepository } from './views/public-listing.repository.js';
import { PublicListingService } from './views/public-listing.service.js';
import { LeaderboardListParams, idParamSchema, listQuerySchema } from './types.js';

export function registerLeaderboardRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  // Register the proper V3 view routes
  registerPublicListingView(app, supabase);

  // Legacy routes for backward compatibility (delegate to the same view logic)
  const repository = new PublicListingRepository(supabase);
  const service = new PublicListingService(repository);

  app.get('/api/v3/leaderboards', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const result = await service.getAll(request.query as LeaderboardListParams);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  app.get('/api/v3/leaderboards/rank', async (request, reply) => {
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

  app.get('/api/v3/leaderboards/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const data = await service.getById((request.params as { id: string }).id);
    return reply.send({ data });
  });
}
