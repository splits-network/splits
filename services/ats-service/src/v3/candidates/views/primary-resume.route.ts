/**
 * GET /api/v3/candidates/:id/view/primary-resume
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CandidatePrimaryResumeRepository } from './primary-resume.repository.js';
import { CandidatePrimaryResumeService } from './primary-resume.service.js';
import { idParamSchema } from '../types.js';

export function registerCandidatePrimaryResumeView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new CandidatePrimaryResumeRepository(supabase);
  const service = new CandidatePrimaryResumeService(repository, supabase);

  app.get('/api/v3/candidates/:id/view/primary-resume', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.getPrimaryResume(id, clerkUserId);
    return reply.send({ data });
  });
}
