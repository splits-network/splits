/**
 * Placement Snapshot V3 Routes
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { PlacementSnapshotRepository } from './repository';
import { PlacementSnapshotService } from './service';
import {
  PlacementSnapshotListParams,
  listQuerySchema,
  placementIdParamSchema,
} from './types';

export function registerPlacementSnapshotRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new PlacementSnapshotRepository(supabase);
  const service = new PlacementSnapshotService(repository, supabase, eventPublisher);

  // GET /api/v3/placement-snapshots — list
  app.get('/api/v3/placement-snapshots', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as PlacementSnapshotListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/placement-snapshots/:placementId — get by placement id
  app.get('/api/v3/placement-snapshots/:placementId', {
    schema: { params: placementIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { placementId } = request.params as { placementId: string };
    const data = await service.getByPlacementId(placementId, clerkUserId);
    return reply.send({ data });
  });
}
