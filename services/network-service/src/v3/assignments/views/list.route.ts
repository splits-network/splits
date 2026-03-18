/**
 * Assignments List View Route
 * GET /api/v3/assignments/views/list
 *
 * Returns assignments with recruiter + job + company joins.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AssignmentListViewRepository } from './list.repository';
import { AssignmentListViewService } from './list.service';
import { AssignmentListParams, listQuerySchema } from '../types';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerAssignmentListView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new AssignmentListViewRepository(supabase);
  const service = new AssignmentListViewService(repository, supabase);

  app.get('/api/v3/assignments/views/list', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.getAll(request.query as AssignmentListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });
}
