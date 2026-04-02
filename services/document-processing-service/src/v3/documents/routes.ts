/**
 * Documents V3 Routes — GET list, GET by id, PATCH
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { DocumentRepository } from './repository.js';
import { DocumentService } from './service.js';
import { DocumentListParams, UpdateDocumentInput, idParamSchema, listQuerySchema, updateDocumentSchema } from './types.js';

export function registerDocumentRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new DocumentRepository(supabase);
  const service = new DocumentService(repository, supabase);

  app.get('/api/v3/documents', { schema: { querystring: listQuerySchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const result = await service.getAll(request.query as DocumentListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  app.get('/api/v3/documents/:id', { schema: { params: idParamSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const data = await service.getById((request.params as { id: string }).id, clerkUserId);
    return reply.send({ data });
  });

  app.patch('/api/v3/documents/:id', { schema: { params: idParamSchema, body: updateDocumentSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const data = await service.update((request.params as { id: string }).id, request.body as UpdateDocumentInput, clerkUserId);
    return reply.send({ data });
  });
}
