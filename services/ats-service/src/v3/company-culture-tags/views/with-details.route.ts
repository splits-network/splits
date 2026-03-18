/**
 * GET /api/v3/company-culture-tags/views/with-details — tags with full culture tag info
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { WithDetailsCompanyCultureTagRepository } from './with-details.repository';
import { listQuerySchema } from '../types';

export function registerWithDetailsView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new WithDetailsCompanyCultureTagRepository(supabase);
  const accessResolver = new AccessContextResolver(supabase);

  app.get('/api/v3/company-culture-tags/views/with-details', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const context = await accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && context.organizationIds.length === 0 && !context.recruiterId) {
      throw new ForbiddenError('Insufficient permissions');
    }

    const { company_id } = request.query as { company_id: string };
    const data = await repository.findByCompanyId(company_id);
    return reply.send({ data });
  });
}
