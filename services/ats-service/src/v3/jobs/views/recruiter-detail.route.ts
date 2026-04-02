/**
 * GET /api/v3/jobs/:id/view/recruiter-detail
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterDetailRepository } from './recruiter-detail.repository.js';
import { RecruiterDetailService } from './recruiter-detail.service.js';
import { idParamSchema } from '../types.js';

export function registerRecruiterDetailView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new RecruiterDetailRepository(supabase);
  const service = new RecruiterDetailService(repository, supabase);

  app.get('/api/v3/jobs/:id/view/recruiter-detail', {
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
