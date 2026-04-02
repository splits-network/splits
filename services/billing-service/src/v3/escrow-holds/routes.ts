/**
 * Escrow Holds V3 Routes
 *
 * Non-parameterized routes before :id routes.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events.js';
import { EscrowHoldRepository } from './repository.js';
import { EscrowHoldService } from './service.js';
import {
  CreateEscrowHoldInput,
  UpdateEscrowHoldInput,
  EscrowHoldListParams,
  listQuerySchema,
  createSchema,
  updateSchema,
  idParamSchema,
  placementIdParamSchema,
} from './types.js';

export function registerEscrowHoldRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new EscrowHoldRepository(supabase);
  const service = new EscrowHoldService(repository, supabase, eventPublisher);

  // --- Non-parameterized routes FIRST ---

  // GET /api/v3/escrow-holds — list
  app.get('/api/v3/escrow-holds', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as EscrowHoldListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/placements/:placementId/escrow-holds — by placement
  app.get('/api/v3/placements/:placementId/escrow-holds', {
    schema: { params: placementIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { placementId } = request.params as { placementId: string };
    const data = await service.getPlacementHolds(placementId, clerkUserId);
    return reply.send({ data });
  });

  // GET /api/v3/placements/:placementId/escrow-holds/total
  app.get('/api/v3/placements/:placementId/escrow-holds/total', {
    schema: { params: placementIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { placementId } = request.params as { placementId: string };
    const data = await service.getPlacementHoldTotal(placementId, clerkUserId);
    return reply.send({ data });
  });

  // --- Standard CRUD ---

  // GET /api/v3/escrow-holds/:id
  app.get('/api/v3/escrow-holds/:id', {
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

  // POST /api/v3/escrow-holds — create
  app.post('/api/v3/escrow-holds', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateEscrowHoldInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/escrow-holds/:id — update
  app.patch('/api/v3/escrow-holds/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateEscrowHoldInput, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/escrow-holds/:id/release — release hold
  app.post('/api/v3/escrow-holds/:id/release', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.release(id, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/escrow-holds/:id/cancel — cancel hold
  app.post('/api/v3/escrow-holds/:id/cancel', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.cancel(id, clerkUserId);
    return reply.send({ data });
  });
}
