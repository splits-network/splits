/**
 * Marketplace Metrics V3 Routes — Core 5 CRUD (admin-only)
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { MarketplaceMetricRepository } from './repository.js';
import { MarketplaceMetricService } from './service.js';
import {
  CreateMetricInput,
  UpdateMetricInput,
  MarketplaceMetricListParams,
  listQuerySchema,
  createSchema,
  updateSchema,
  idParamSchema,
} from './types.js';

export function registerMarketplaceMetricRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
) {
  const repository = new MarketplaceMetricRepository(supabase);
  const service = new MarketplaceMetricService(repository, supabase);

  // GET /api/v3/marketplace-metrics — list
  app.get('/api/v3/marketplace-metrics', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as MarketplaceMetricListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/marketplace-metrics/:id
  app.get('/api/v3/marketplace-metrics/:id', {
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

  // POST /api/v3/marketplace-metrics
  app.post('/api/v3/marketplace-metrics', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateMetricInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/marketplace-metrics/:id
  app.patch('/api/v3/marketplace-metrics/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateMetricInput, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/marketplace-metrics/:id
  app.delete('/api/v3/marketplace-metrics/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Marketplace metric deleted successfully' } });
  });
}
