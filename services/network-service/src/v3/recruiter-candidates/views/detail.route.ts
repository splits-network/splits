/**
 * GET /api/v3/recruiter-candidates/:id/view/detail
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { DetailViewRepository } from './detail.repository.js';
import { DetailViewService } from './detail.service.js';
import { idParamSchema } from '../types.js';

export function registerRecruiterCandidateDetailView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new DetailViewRepository(supabase);
  const service = new DetailViewService(repository, supabase);

  app.get('/api/v3/recruiter-candidates/:id/view/detail', {
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
