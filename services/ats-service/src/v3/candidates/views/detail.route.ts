/**
 * GET /api/v3/candidates/:id/view/detail
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CandidateDetailRepository } from './detail.repository.js';
import { CandidateDetailService } from './detail.service.js';
import { RecruiterSavedCandidateRepository } from '../../recruiter-saved-candidates/repository.js';
import { idParamSchema } from '../types.js';

export function registerCandidateDetailView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new CandidateDetailRepository(supabase);
  const savedCandidateRepo = new RecruiterSavedCandidateRepository(supabase);
  const service = new CandidateDetailService(repository, savedCandidateRepo, supabase);

  app.get('/api/v3/candidates/:id/view/detail', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.getDetail(id, clerkUserId);
    reply.header('Cache-Control', 'private, max-age=30');
    return reply.send({ data });
  });
}
