/**
 * GET /api/v3/candidates/:id/view/dashboard-stats
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CandidateDashboardStatsRepository } from './dashboard-stats.repository.js';
import { CandidateDashboardStatsService } from './dashboard-stats.service.js';
import { idParamSchema } from '../types.js';

export function registerCandidateDashboardStatsView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new CandidateDashboardStatsRepository(supabase);
  const service = new CandidateDashboardStatsService(repository, supabase);

  app.get('/api/v3/candidates/:id/view/dashboard-stats', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.getDashboardStats(id, clerkUserId);
    reply.header('Cache-Control', 'private, max-age=30');
    return reply.send({ data });
  });
}
