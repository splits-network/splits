/**
 * Content Tags V3 Routes — List, Get, Create, Delete
 *
 * Routes are registered at both /api/v3/* (for api-gateway) and /* (for admin-gateway).
 * Admin-gateway strips /api/v3/content prefix, so content-service receives bare paths.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { TagRepository } from './repository';
import { TagService } from './service';
import { CreateTagInput, TagListParams, listQuerySchema, createSchema, idParamSchema } from './types';

export function registerTagRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new TagRepository(supabase);
  const service = new TagService(repository, supabase);

  // --- Handlers ---

  const listHandler = async (request: any, reply: any) => {
    const result = await service.getAll(request.query as TagListParams);
    return reply.send({ data: result.data, pagination: result.pagination });
  };

  const getByIdHandler = async (request: any, reply: any) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.getById(id);
    return reply.send({ data });
  };

  const createHandler = async (request: any, reply: any) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateTagInput, clerkUserId);
    return reply.code(201).send({ data });
  };

  const deleteHandler = async (request: any, reply: any) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Content tag deleted successfully' } });
  };

  // --- API Gateway routes (full /api/v3 prefix) ---

  app.get('/api/v3/public/content-tags', { schema: { querystring: listQuerySchema } }, listHandler);
  app.get('/api/v3/content-tags', { schema: { querystring: listQuerySchema } }, listHandler);
  app.get('/api/v3/content-tags/:id', { schema: { params: idParamSchema } }, getByIdHandler);
  app.post('/api/v3/content-tags', { schema: { body: createSchema } }, createHandler);
  app.delete('/api/v3/content-tags/:id', { schema: { params: idParamSchema } }, deleteHandler);

  // --- Admin Gateway routes (no prefix — admin-gateway strips /api/v3/content) ---

  app.get('/content-tags', { schema: { querystring: listQuerySchema } }, listHandler);
  app.get('/content-tags/:id', { schema: { params: idParamSchema } }, getByIdHandler);
  app.post('/content-tags', { schema: { body: createSchema } }, createHandler);
  app.delete('/content-tags/:id', { schema: { params: idParamSchema } }, deleteHandler);
}
