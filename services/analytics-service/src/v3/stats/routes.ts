/**
 * Stats V3 Routes
 *
 * GET stats (scope-based), platform-activity view, top-performers view.
 * Views registered before parameterized routes.
 */

import { FastifyInstance } from 'fastify';
import { StatsServiceV2 } from '../../v2/stats/service';
import { StatsV3Repository } from './repository';
import { StatsV3Service } from './service';
import { StatsQueryParams, statsQuerySchema } from './types';

export function registerStatsRoutes(
  app: FastifyInstance,
  statsServiceV2: StatsServiceV2,
) {
  const repository = new StatsV3Repository(statsServiceV2);
  const service = new StatsV3Service(repository);

  // GET /api/v3/stats/views/platform-activity — admin only
  app.get('/api/v3/stats/views/platform-activity', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.getPlatformActivity(clerkUserId);
    return reply.send({ data });
  });

  // GET /api/v3/stats/views/top-performers — admin only
  app.get('/api/v3/stats/views/top-performers', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.getTopPerformers(clerkUserId);
    return reply.send({ data });
  });

  // GET /api/v3/stats — scope-based statistics
  app.get('/api/v3/stats', {
    schema: { querystring: statsQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.getStats(clerkUserId, request.query as StatsQueryParams);
    return reply.send({ data });
  });
}
