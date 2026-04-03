/**
 * GET /api/v3/recruiter-candidates/views/list-for-candidate
 *
 * Returns all recruiter-candidate relationships for the authenticated candidate,
 * enriched with recruiter name, email, and user_id (for presence lookups).
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { ListForCandidateViewRepository } from './list-for-candidate.repository.js';
import { ListForCandidateViewService } from './list-for-candidate.service.js';

export function registerListForCandidateView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new ListForCandidateViewRepository(supabase);
  const service = new ListForCandidateViewService(repository, supabase);

  app.get('/api/v3/recruiter-candidates/views/list-for-candidate', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
      });
    }

    const result = await service.listForCandidate(clerkUserId);
    reply.header('Cache-Control', 'private, max-age=30');
    return reply.send(result);
  });
}
