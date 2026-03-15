/**
 * GET /api/v3/recruiters/views/marketplace-listing
 * Auth: None — public marketplace data
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { MarketplaceListingRepository } from './marketplace-listing.repository';
import { MarketplaceListingService } from './marketplace-listing.service';
import { listQuerySchema, RecruiterListParams } from '../types';

export function registerMarketplaceListingView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new MarketplaceListingRepository(supabase);
  const service = new MarketplaceListingService(repository);

  app.get('/api/v3/recruiters/views/marketplace-listing', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const query = request.query as any;
    let parsedFilters: Record<string, any> = {};
    if (query.filters) {
      try {
        parsedFilters = typeof query.filters === 'string' ? JSON.parse(query.filters) : query.filters;
      } catch { /* ignore */ }
    }
    const params: RecruiterListParams = { ...query, filters: parsedFilters };
    const result = await service.getListing(params);
    reply.header('Cache-Control', 'public, max-age=60');
    return reply.send({ data: result.data, pagination: result.pagination });
  });
}
