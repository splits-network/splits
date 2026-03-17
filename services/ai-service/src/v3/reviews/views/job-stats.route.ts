/**
 * Job Stats View Route
 * GET /api/v3/ai-reviews/views/job-stats?job_id=<uuid>
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { JobStatsRepository } from './job-stats.repository';
import { JobStatsService } from './job-stats.service';

const jobStatsQuerySchema = {
  type: 'object',
  required: ['job_id'],
  properties: {
    job_id: { type: 'string', format: 'uuid' },
  },
  additionalProperties: false,
};

export function registerJobStatsViewRoute(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new JobStatsRepository(supabase);
  const service = new JobStatsService(repository, supabase);

  app.get('/api/v3/ai-reviews/views/job-stats', {
    schema: { querystring: jobStatsQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { job_id } = request.query as { job_id: string };
    const data = await service.getStats(job_id, clerkUserId);
    return reply.send({ data });
  });
}
