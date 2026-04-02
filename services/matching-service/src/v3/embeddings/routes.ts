/**
 * Embeddings V3 Routes — Read-only, admin-only
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { EmbeddingRepository } from './repository.js';
import { EmbeddingService } from './service.js';
import { EmbeddingListParams, idParamSchema, listQuerySchema } from './types.js';

export function registerEmbeddingRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
) {
  const repository = new EmbeddingRepository(supabase);
  const service = new EmbeddingService(repository, supabase);

  // GET /api/v3/embeddings
  app.get('/api/v3/embeddings', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as EmbeddingListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/embeddings/:id
  app.get('/api/v3/embeddings/:id', {
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
}
