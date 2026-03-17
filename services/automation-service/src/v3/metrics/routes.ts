/**
 * Marketplace Metrics V3 Routes — GET list, GET by id
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { MetricRepository } from './repository';
import { MetricService } from './service';
import { MetricListParams, idParamSchema, listQuerySchema } from './types';

export function registerMetricRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new MetricRepository(supabase);
  const service = new MetricService(repository, supabase);

  app.get('/api/v3/marketplace-metrics', { schema: { querystring: listQuerySchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const result = await service.getAll(request.query as MetricListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  app.get('/api/v3/marketplace-metrics/:id', { schema: { params: idParamSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const data = await service.getById((request.params as { id: string }).id, clerkUserId);
    return reply.send({ data });
  });
}
