/**
 * Activity V3 Routes
 *
 * POST heartbeat (public, no auth), GET snapshot (admin-only view).
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { ActivityService } from '../../v2/activity/service.js';
import { ActivityRepository } from './repository.js';
import { ActivityV3Service } from './service.js';
import { HeartbeatInput, heartbeatSchema } from './types.js';

export function registerActivityRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  activityService: ActivityService,
) {
  const repository = new ActivityRepository(activityService);
  const service = new ActivityV3Service(repository, supabase);

  // POST /api/v3/activity/actions/heartbeat — public, no auth
  app.post('/api/v3/activity/actions/heartbeat', {
    schema: { body: heartbeatSchema },
  }, async (request, reply) => {
    await service.recordHeartbeat(request.body as HeartbeatInput);
    return reply.code(204).send();
  });

  // GET /api/v3/activity/views/online — admin snapshot
  app.get('/api/v3/activity/views/online', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.getSnapshot(clerkUserId);
    return reply.send({ data });
  });
}
