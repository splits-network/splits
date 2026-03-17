/**
 * Analytics Views V3 Routes
 *
 * GET /api/v3/views/:type — pre-computed dashboard data by type.
 * Views are read-only, no CRUD needed.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { ViewService } from './service';
import { ViewRepository } from './repository';
import { ViewType, viewTypeParamSchema, viewQuerySchema } from './types';

export function registerViewRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new ViewRepository(supabase);
  const service = new ViewService(repository, supabase);

  app.get('/api/v3/views/:type', {
    schema: { params: viewTypeParamSchema, querystring: viewQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const { type } = request.params as { type: ViewType };
    const { limit } = request.query as { limit?: number };
    const data = await service.getView(clerkUserId, type, limit || 20);
    return reply.send({ data });
  });
}