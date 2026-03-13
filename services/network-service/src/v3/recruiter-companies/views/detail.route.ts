/**
 * Recruiter-Companies Detail View Route
 * GET /api/v3/recruiter-companies/:id/view/detail
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterCompanyDetailRepository } from './detail.repository';
import { RecruiterCompanyDetailService } from './detail.service';
import { idParamSchema } from '../types';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerRecruiterCompanyDetailView(
  app: FastifyInstance,
  supabase: SupabaseClient
) {
  const repository = new RecruiterCompanyDetailRepository(supabase);
  const service = new RecruiterCompanyDetailService(repository, supabase);

  app.get('/api/v3/recruiter-companies/:id/view/detail', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);

    const { id } = request.params as { id: string };
    const data = await service.getDetail(id, clerkUserId);
    return reply.send({ data });
  });
}
