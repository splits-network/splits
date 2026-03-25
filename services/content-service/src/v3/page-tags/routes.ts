/**
 * Content Page Tags V3 Routes — List, Add, Remove, Bulk Replace
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { PageTagRepository } from './repository';
import { PageTagService } from './service';
import { registerWithDetailsView } from './views/with-details.route';
import {
  CreatePageTagInput,
  BulkReplacePageTagsInput,
  listQuerySchema,
  createSchema,
  bulkReplaceSchema,
  pageIdParamSchema,
  deleteParamSchema,
} from './types';

export function registerPageTagRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new PageTagRepository(supabase);
  const service = new PageTagService(repository, supabase);

  // Register views before parameterized routes
  registerWithDetailsView(app, supabase);

  // GET /api/v3/content-page-tags?page_id=
  app.get('/api/v3/content-page-tags', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { page_id } = request.query as { page_id: string };
    const data = await service.listByPageId(page_id, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/content-page-tags — add single
  app.post('/api/v3/content-page-tags', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreatePageTagInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // DELETE /api/v3/content-page-tags/:pageId/:tagId
  app.delete('/api/v3/content-page-tags/:pageId/:tagId', {
    schema: { params: deleteParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { pageId, tagId } = request.params as { pageId: string; tagId: string };
    await service.delete(pageId, tagId, clerkUserId);
    return reply.code(204).send();
  });

  // PUT /api/v3/content-page-tags/page/:pageId/bulk-replace
  app.put('/api/v3/content-page-tags/page/:pageId/bulk-replace', {
    schema: { params: pageIdParamSchema, body: bulkReplaceSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { pageId } = request.params as { pageId: string };
    const { tags } = request.body as BulkReplacePageTagsInput;
    const data = await service.bulkReplace(pageId, tags, clerkUserId);
    return reply.send({ data });
  });
}
