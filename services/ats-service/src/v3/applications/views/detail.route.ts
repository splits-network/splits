/**
 * Application Detail View Route
 *
 * GET /api/v3/applications/:id/view/detail
 *
 * Returns the full application with candidate, job, company, sourcer data,
 * and optional includes (recruiter, audit, documents, ai_review).
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { ApplicationDetailRepository } from './detail.repository.js';
import { ApplicationDetailService } from './detail.service.js';
import { idParamSchema } from '../types.js';

const detailQuerySchema = {
  type: 'object',
  properties: {
    include: { type: 'string' },
  },
};

export function registerApplicationDetailView(
  app: FastifyInstance,
  supabase: SupabaseClient
) {
  const repository = new ApplicationDetailRepository(supabase);
  const service = new ApplicationDetailService(repository, supabase);

  app.get('/api/v3/applications/:id/view/detail', {
    schema: { params: idParamSchema, querystring: detailQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
      });
    }
    const { id } = request.params as { id: string };
    const include = (request.query as any)?.include;
    const data = await service.getDetail(id, clerkUserId, include);
    reply.header('Cache-Control', 'private, max-age=30');
    return reply.send({ data });
  });
}
