/**
 * User Role Detail View Routes
 * GET /api/v3/user-roles/views/detail — list with joined user + role
 * GET /api/v3/user-roles/:id/view/detail — single with joined user + role
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { idParamSchema, listQuerySchema, UserRoleListParams } from '../types';
import { UserRoleDetailViewRepository } from './detail.repository';
import { UserRoleDetailViewService } from './detail.service';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerUserRoleDetailView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new UserRoleDetailViewRepository(supabase);
  const service = new UserRoleDetailViewService(repository, supabase);

  // List view — joined data
  app.get('/api/v3/user-roles/views/detail', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.getList(request.query as UserRoleListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // Detail view — single record with joins
  app.get('/api/v3/user-roles/:id/view/detail', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.getDetail(id, clerkUserId);
    return reply.send({ data });
  });
}
