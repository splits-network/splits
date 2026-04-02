/**
 * Recruiter-Candidates List View Route
 * GET /api/v3/recruiter-candidates/views/list
 *
 * Returns recruiter-candidates with candidate + recruiter joins.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterCandidateListViewRepository } from './list.repository.js';
import { RecruiterCandidateListViewService } from './list.service.js';
import { RecruiterCandidateListParams, listQuerySchema } from '../types.js';

export function registerRecruiterCandidateListView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new RecruiterCandidateListViewRepository(supabase);
  const service = new RecruiterCandidateListViewService(repository, supabase);

  app.get('/api/v3/recruiter-candidates/views/list', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    const query = request.query as any;
    let parsedFilters: Record<string, any> = {};
    if (query.filters) {
      try { parsedFilters = typeof query.filters === 'string' ? JSON.parse(query.filters) : query.filters; } catch { /* ignore */ }
    }
    const params: RecruiterCandidateListParams = { ...query, filters: parsedFilters };
    const result = await service.getAll(params, clerkUserId || undefined);
    return reply.send({ data: result.data, pagination: result.pagination });
  });
}
