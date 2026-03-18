/**
 * Assignment Detail View Route
 * GET /api/v3/assignments/:id/view/detail
 *
 * Returns assignment with recruiter + job + company joins.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AssignmentDetailViewRepository } from './detail.repository';
import { AssignmentDetailViewService } from './detail.service';
import { idParamSchema } from '../types';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerAssignmentDetailView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new AssignmentDetailViewRepository(supabase);
  const service = new AssignmentDetailViewService(repository, supabase);

  app.get('/api/v3/assignments/:id/view/detail', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.getDetail(id, clerkUserId);
    return reply.send({ data });
  });
}
