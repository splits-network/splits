/**
 * Recruiter-Companies List View Route
 * GET /api/v3/recruiter-companies/views/list
 *
 * Returns paginated relationships with recruiter+user and company joins.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterCompanyListRepository } from './list.repository';
import { RecruiterCompanyListService } from './list.service';
import { listQuerySchema, RecruiterCompanyListParams } from '../types';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerRecruiterCompanyListView(
  app: FastifyInstance,
  supabase: SupabaseClient
) {
  const repository = new RecruiterCompanyListRepository(supabase);
  const service = new RecruiterCompanyListService(repository, supabase);

  app.get('/api/v3/recruiter-companies/views/list', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);

    const params = request.query as RecruiterCompanyListParams;
    const result = await service.getList(params, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });
}
