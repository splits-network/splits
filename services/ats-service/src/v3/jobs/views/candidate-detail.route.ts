/**
 * GET /api/v3/jobs/:id/view/candidate-detail
 * Auth: Optional (public access allowed)
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CandidateDetailRepository } from './candidate-detail.repository';
import { CandidateDetailService } from './candidate-detail.service';
import { idParamSchema } from '../types';

export function registerCandidateDetailView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new CandidateDetailRepository(supabase);
  const service = new CandidateDetailService(repository);

  app.get('/api/v3/jobs/:id/view/candidate-detail', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    // Auth is optional — enrich with match score when authenticated
    const clerkUserId = request.headers['x-clerk-user-id'] as string | undefined;
    const { id } = request.params as { id: string };
    const data = await service.getDetail(id, clerkUserId);
    reply.header('Cache-Control', clerkUserId ? 'private, no-cache' : 'public, max-age=60');
    return reply.send({ data });
  });
}
