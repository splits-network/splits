/**
 * GET /api/v3/job-recommendations/:id/view/detail
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { JobRecommendationDetailRepository } from './detail.repository.js';
import { JobRecommendationDetailService } from './detail.service.js';
import { idParamSchema } from '../types.js';

export function registerJobRecommendationDetailView(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new JobRecommendationDetailRepository(supabase);
  const service = new JobRecommendationDetailService(repository, supabase);

  app.get('/api/v3/job-recommendations/:id/view/detail', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.getDetail(id, clerkUserId);
    reply.header('Cache-Control', 'private, max-age=30');
    return reply.send({ data });
  });
}
