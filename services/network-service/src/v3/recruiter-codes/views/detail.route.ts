/**
 * Recruiter-Code Detail View Route
 * GET /api/v3/recruiter-codes/:id/view/detail
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterCodeDetailRepository } from './detail.repository';
import { RecruiterCodeDetailService } from './detail.service';
import { idParamSchema } from '../types';

export function registerRecruiterCodeDetailView(
  app: FastifyInstance,
  supabase: SupabaseClient
) {
  const repository = new RecruiterCodeDetailRepository(supabase);
  const service = new RecruiterCodeDetailService(repository, supabase);

  app.get('/api/v3/recruiter-codes/:id/view/detail', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.getDetail(id, clerkUserId);
    return reply.send({ data });
  });
}
