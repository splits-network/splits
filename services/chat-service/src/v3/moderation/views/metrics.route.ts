/**
 * Metrics View Route
 *
 * GET /api/v3/moderation/views/metrics
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { MetricsRepository } from './metrics.repository.js';
import { MetricsService } from './metrics.service.js';
import { metricsQuerySchema } from '../types.js';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerMetricsView(
  app: FastifyInstance,
  supabase: SupabaseClient,
) {
  const repository = new MetricsRepository(supabase);
  const service = new MetricsService(repository, supabase);

  app.get('/api/v3/moderation/views/metrics', {
    schema: { querystring: metricsQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const query = request.query as { rangeDays?: number };
    const data = await service.getMetrics(query.rangeDays || 7, clerkUserId);
    return reply.send({ data });
  });
}
