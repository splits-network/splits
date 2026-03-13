/**
 * Content Images V3 Routes — list, get, update, delete (admin-only)
 * POST/upload is multipart and remains in V2.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { ImageRepository } from './repository';
import { ImageService } from './service';
import {
  ImageListParams,
  UpdateImageInput,
  listQuerySchema,
  updateSchema,
  idParamSchema,
} from './types';

export function registerImageRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
) {
  const repository = new ImageRepository(supabase);
  const service = new ImageService(repository, supabase);

  // GET /api/v3/content-images — list
  app.get('/api/v3/content-images', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as ImageListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/content-images/:id
  app.get('/api/v3/content-images/:id', {
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

  // PATCH /api/v3/content-images/:id
  app.patch('/api/v3/content-images/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateImageInput, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/content-images/:id
  app.delete('/api/v3/content-images/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Image deleted successfully' } });
  });
}
