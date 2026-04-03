/**
 * Charts V3 Routes
 *
 * GET /api/v3/charts/views/:type — chart data by type.
 * Charts are read-only views, no CRUD needed.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { ChartServiceV2 } from '../../v2/charts/service.js';
import { ChartV3Service } from './service.js';
import { ChartType, ChartFilters, chartTypeParamSchema, chartQuerySchema } from './types.js';

export function registerChartRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  chartServiceV2: ChartServiceV2,
) {
  const service = new ChartV3Service(chartServiceV2, supabase);

  // GET /api/v3/charts/views/:type
  app.get('/api/v3/charts/views/:type', {
    schema: { params: chartTypeParamSchema, querystring: chartQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { type } = request.params as { type: ChartType };
    const query = request.query as ChartFilters;
    const data = await service.getChartData(clerkUserId, type, query);
    return reply.send({ data });
  });
}
