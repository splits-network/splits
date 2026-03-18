/**
 * Admin Chart Data View Route
 * GET /admin/chart-data
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AdminChartsRepository } from './charts.repository';
import { periodQuerySchema } from '../types';

export function registerAdminChartsView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new AdminChartsRepository(supabase);

  // GET /v3/admin/chart-data?period=30d
  app.get('/v3/admin/chart-data', {
    schema: { querystring: periodQuerySchema },
  }, async (request, reply) => {
    const { period } = request.query as { period?: string };
    const data = await repository.getChartData(period || '30d');
    return reply.send({ data });
  });
}
