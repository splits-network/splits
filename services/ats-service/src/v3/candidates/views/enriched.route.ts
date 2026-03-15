/**
 * GET /api/v3/candidates/views/enriched
 *
 * Enriched list view — same scoping as core CRUD list but with
 * relationship status fields (has_active_relationship, etc.) computed.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CandidateEnrichedRepository } from './enriched.repository';
import { CandidateEnrichedService } from './enriched.service';
import { CandidateRepository } from '../repository';
import { CandidateListParams, listQuerySchema } from '../types';

export function registerCandidateEnrichedView(app: FastifyInstance, supabase: SupabaseClient) {
  const enrichedRepo = new CandidateEnrichedRepository(supabase);
  const crudRepo = new CandidateRepository(supabase);
  const service = new CandidateEnrichedService(enrichedRepo, crudRepo, supabase);

  app.get('/api/v3/candidates/views/enriched', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as CandidateListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });
}
