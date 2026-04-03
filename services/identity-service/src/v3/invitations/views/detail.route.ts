/**
 * Invitation Detail View Routes
 * GET /api/v3/invitations/views/detail — list with joined org + company
 * GET /api/v3/invitations/:id/view/detail — single with joined data
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { idParamSchema, listQuerySchema, InvitationListParams } from '../types.js';
import { InvitationDetailViewRepository } from './detail.repository.js';
import { InvitationDetailViewService } from './detail.service.js';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerInvitationDetailView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new InvitationDetailViewRepository(supabase);
  const service = new InvitationDetailViewService(repository, supabase);

  // List view — joined data
  app.get('/api/v3/invitations/views/detail', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.getList(request.query as InvitationListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // Detail view — single record with joins
  app.get('/api/v3/invitations/:id/view/detail', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const { email } = request.query as { email?: string };
    const data = await service.getDetail(id, clerkUserId, email);
    return reply.send({ data });
  });
}
