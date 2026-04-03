/**
 * Job Activity Log — Route
 *
 * GET /api/v3/jobs/:id/activity — paginated activity timeline
 */

import { FastifyInstance } from 'fastify';
import { JobActivityService } from './service.js';
import { idParamSchema } from '../types.js';
import { activityListQuerySchema, ActivityListParams } from './types.js';

export function registerActivityRoute(
  app: FastifyInstance,
  activityService: JobActivityService
) {
  app.get('/api/v3/jobs/:id/activity', {
    schema: {
      params: idParamSchema,
      querystring: activityListQuerySchema,
    },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
      });
    }

    const { id } = request.params as { id: string };
    const params = request.query as ActivityListParams;

    const result = await activityService.getActivityForJob(id, params, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });
}
