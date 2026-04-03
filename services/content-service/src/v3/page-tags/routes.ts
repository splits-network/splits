/**
 * Content Page Tags V3 Routes — List, Add, Remove, Bulk Replace
 *
 * Routes are registered at both /api/v3/* (for api-gateway) and /* (for admin-gateway).
 * Admin-gateway strips /api/v3/content prefix, so content-service receives bare paths.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { PageTagRepository } from './repository.js';
import { PageTagService } from './service.js';
import { registerWithDetailsView } from './views/with-details.route.js';
import {
  CreatePageTagInput,
  BulkReplacePageTagsInput,
  listQuerySchema,
  createSchema,
  bulkReplaceSchema,
  pageIdParamSchema,
  deleteParamSchema,
} from './types.js';

export function registerPageTagRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new PageTagRepository(supabase);
  const service = new PageTagService(repository, supabase);

  // Register views before parameterized routes
  registerWithDetailsView(app, supabase);

  // --- Handlers ---

  const listHandler = async (request: any, reply: any) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { page_id } = request.query as { page_id: string };
    const data = await service.listByPageId(page_id, clerkUserId);
    return reply.send({ data });
  };

  const createHandler = async (request: any, reply: any) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreatePageTagInput, clerkUserId);
    return reply.code(201).send({ data });
  };

  const deleteHandler = async (request: any, reply: any) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { pageId, tagId } = request.params as { pageId: string; tagId: string };
    await service.delete(pageId, tagId, clerkUserId);
    return reply.code(204).send();
  };

  const bulkReplaceHandler = async (request: any, reply: any) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { pageId } = request.params as { pageId: string };
    const { tags } = request.body as BulkReplacePageTagsInput;
    const data = await service.bulkReplace(pageId, tags, clerkUserId);
    return reply.send({ data });
  };

  // --- API Gateway routes (full /api/v3 prefix) ---

  app.get('/api/v3/content-page-tags', { schema: { querystring: listQuerySchema } }, listHandler);
  app.post('/api/v3/content-page-tags', { schema: { body: createSchema } }, createHandler);
  app.delete('/api/v3/content-page-tags/:pageId/:tagId', { schema: { params: deleteParamSchema } }, deleteHandler);
  app.put('/api/v3/content-page-tags/page/:pageId/bulk-replace', {
    schema: { params: pageIdParamSchema, body: bulkReplaceSchema },
  }, bulkReplaceHandler);

  // --- Admin Gateway routes (no prefix — admin-gateway strips /api/v3/content) ---

  app.get('/content-page-tags', { schema: { querystring: listQuerySchema } }, listHandler);
  app.post('/content-page-tags', { schema: { body: createSchema } }, createHandler);
  app.delete('/content-page-tags/:pageId/:tagId', { schema: { params: deleteParamSchema } }, deleteHandler);
  app.put('/content-page-tags/page/:pageId/bulk-replace', {
    schema: { params: pageIdParamSchema, body: bulkReplaceSchema },
  }, bulkReplaceHandler);
}
