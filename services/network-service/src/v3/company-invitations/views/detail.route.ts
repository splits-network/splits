/**
 * GET /api/v3/company-invitations/:id/view/detail
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CompanyInvitationDetailRepository } from './detail.repository';
import { CompanyInvitationDetailService } from './detail.service';
import { idParamSchema } from '../types';

export function registerCompanyInvitationDetailView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new CompanyInvitationDetailRepository(supabase);
  const service = new CompanyInvitationDetailService(repository, supabase);

  app.get('/api/v3/company-invitations/:id/view/detail', {
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
