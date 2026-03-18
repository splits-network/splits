/**
 * Company-Invitations List View Route
 * GET /api/v3/company-invitations/views/list
 *
 * Returns company invitations with recruiter + user joins.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CompanyInvitationListViewRepository } from './list.repository';
import { CompanyInvitationListViewService } from './list.service';
import { CompanyInvitationListParams, listQuerySchema } from '../types';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerCompanyInvitationListView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new CompanyInvitationListViewRepository(supabase);
  const service = new CompanyInvitationListViewService(repository, supabase);

  app.get('/api/v3/company-invitations/views/list', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.getAll(request.query as CompanyInvitationListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });
}
