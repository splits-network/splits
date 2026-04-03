/**
 * GET /api/v3/placements/views/enriched
 * Returns placements with joined candidate + job + company + splits data
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { EnrichedPlacementRepository } from './enriched.repository.js';
import { EnrichedPlacementService } from './enriched.service.js';
import { listQuerySchema, PlacementListParams } from '../types.js';

export function registerEnrichedPlacementView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new EnrichedPlacementRepository(supabase);
  const service = new EnrichedPlacementService(repository, supabase);

  app.get('/api/v3/placements/views/enriched', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getEnriched(request.query as PlacementListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });
}
