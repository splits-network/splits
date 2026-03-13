/**
 * Company Reputation V3 Routes — Read-only endpoints
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CompanyReputationRepository } from './repository';
import { CompanyReputationService } from './service';
import { CompanyReputationListParams, listQuerySchema, companyIdParamSchema } from './types';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

function getClerkUserId(request: any): string | null {
  return (request.headers['x-clerk-user-id'] as string) || null;
}

export function registerCompanyReputationRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient
) {
  const repository = new CompanyReputationRepository(supabase);
  const service = new CompanyReputationService(repository, supabase);

  // GET /api/v3/company-reputation — list
  app.get('/api/v3/company-reputation', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.getAll(request.query as CompanyReputationListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/company-reputation/:companyId — get by company id
  app.get('/api/v3/company-reputation/:companyId', {
    schema: { params: companyIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { companyId } = request.params as { companyId: string };
    const data = await service.getByCompanyId(companyId, clerkUserId);
    return reply.send({ data });
  });
}
