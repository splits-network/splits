/**
 * Recruiter-Codes List View Route
 * GET /api/v3/recruiter-codes/views/list
 *
 * Returns recruiter codes with recruiter + user joins.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterCodeListViewRepository } from './list.repository.js';
import { RecruiterCodeListViewService } from './list.service.js';
import { RecruiterCodeListParams, listQuerySchema } from '../types.js';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerRecruiterCodeListView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new RecruiterCodeListViewRepository(supabase);
  const service = new RecruiterCodeListViewService(repository, supabase);

  app.get('/api/v3/recruiter-codes/views/list', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.getAll(request.query as RecruiterCodeListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });
}
