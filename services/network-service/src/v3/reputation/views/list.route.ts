/**
 * Reputation List View Route
 * GET /api/v3/reputation/views/list
 *
 * Returns reputation records with recruiter joins.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { ReputationListViewRepository } from './list.repository';
import { ReputationListViewService } from './list.service';
import { ReputationListParams, listQuerySchema } from '../types';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerReputationListView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new ReputationListViewRepository(supabase);
  const service = new ReputationListViewService(repository, supabase);

  app.get('/api/v3/reputation/views/list', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.getAll(request.query as ReputationListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });
}
