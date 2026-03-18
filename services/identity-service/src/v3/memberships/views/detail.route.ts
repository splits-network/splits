/**
 * Membership Detail View Routes
 * GET /api/v3/memberships/views/detail — list with joined user + org + company + role
 * GET /api/v3/memberships/:id/view/detail — single with joined data
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { idParamSchema, listQuerySchema, MembershipListParams } from '../types';
import { MembershipDetailViewRepository } from './detail.repository';
import { MembershipDetailViewService } from './detail.service';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerMembershipDetailView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new MembershipDetailViewRepository(supabase);
  const service = new MembershipDetailViewService(repository, supabase);

  // List view — joined data
  app.get('/api/v3/memberships/views/detail', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.getList(request.query as MembershipListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // Detail view — single record with joins
  app.get('/api/v3/memberships/:id/view/detail', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.getDetail(id, clerkUserId);
    return reply.send({ data });
  });
}
