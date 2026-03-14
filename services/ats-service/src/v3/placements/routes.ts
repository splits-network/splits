/**
 * Placements V3 Routes — Core 5 CRUD + Views
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { PlacementRepository } from './repository';
import { PlacementService } from './service';
import { registerPlacementDetailView } from './views/detail.route';
import { registerEnrichedPlacementView } from './views/enriched.route';
import {
  CreatePlacementInput,
  UpdatePlacementInput,
  PlacementListParams,
  listQuerySchema,
  createSchema,
  updateSchema,
  idParamSchema,
} from './types';

export function registerPlacementRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  // --- Views (registered before :id routes to avoid collision) ---
  registerEnrichedPlacementView(app, supabase);
  registerPlacementDetailView(app, supabase);

  const repository = new PlacementRepository(supabase);
  const service = new PlacementService(repository, supabase, eventPublisher);

  // --- Core 5 CRUD ---

  // GET /api/v3/placements — list
  app.get('/api/v3/placements', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as PlacementListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/placements/:id — get by id
  app.get('/api/v3/placements/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.getById(id, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/placements — create
  app.post('/api/v3/placements', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreatePlacementInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/placements/:id — update
  app.patch('/api/v3/placements/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdatePlacementInput, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/placements/:id — soft delete (admin only)
  app.delete('/api/v3/placements/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Placement deleted successfully' } });
  });
}
