/**
 * GET /api/v3/jobs/views/candidate-listing
 * Auth: Optional (unauthenticated = public listing)
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CandidateListingRepository } from './candidate-listing.repository';
import { CandidateListingService } from './candidate-listing.service';
import { listQuerySchema, JobListParams } from '../types';

export function registerCandidateListingView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new CandidateListingRepository(supabase);
  const service = new CandidateListingService(repository);

  app.get('/api/v3/jobs/views/candidate-listing', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    // Auth is optional — enrich with match scores when authenticated
    const clerkUserId = request.headers['x-clerk-user-id'] as string | undefined;
    const result = await service.getListing(request.query as JobListParams, clerkUserId);
    reply.header('Cache-Control', clerkUserId ? 'private, no-cache' : 'public, max-age=60');
    return reply.send(result);
  });
}
