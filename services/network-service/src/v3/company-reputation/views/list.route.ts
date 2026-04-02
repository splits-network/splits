/**
 * Company Reputation List View Route
 * GET /api/v3/company-reputation/views/list
 * GET /api/v3/company-reputation/:companyId/view/detail
 *
 * Returns company reputation records with company joins.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CompanyReputationListViewRepository } from './list.repository.js';
import { CompanyReputationListViewService } from './list.service.js';
import { CompanyReputationListParams, listQuerySchema, companyIdParamSchema } from '../types.js';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerCompanyReputationListView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new CompanyReputationListViewRepository(supabase);
  const service = new CompanyReputationListViewService(repository, supabase);

  app.get('/api/v3/company-reputation/views/list', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.getAll(request.query as CompanyReputationListParams);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  app.get('/api/v3/company-reputation/:companyId/view/detail', {
    schema: { params: companyIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { companyId } = request.params as { companyId: string };
    const data = await service.getByCompanyId(companyId);
    return reply.send({ data });
  });
}
