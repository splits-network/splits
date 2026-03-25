/**
 * GET /api/v3/content-page-tags/views/with-details — page tags with full tag info
 *
 * Registered at both /api/v3/* (api-gateway) and /* (admin-gateway).
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { WithDetailsPageTagRepository } from './with-details.repository';
import { listQuerySchema } from '../types';

export function registerWithDetailsView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new WithDetailsPageTagRepository(supabase);
  const accessResolver = new AccessContextResolver(supabase);

  const handler = async (request: any, reply: any) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const context = await accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only admins can view page tags');
    }

    const { page_id } = request.query as { page_id: string };
    const data = await repository.findByPageId(page_id);
    return reply.send({ data });
  };

  // API Gateway route
  app.get('/api/v3/content-page-tags/views/with-details', {
    schema: { querystring: listQuerySchema },
  }, handler);

  // Admin Gateway route (no /api/v3 prefix)
  app.get('/content-page-tags/views/with-details', {
    schema: { querystring: listQuerySchema },
  }, handler);
}
