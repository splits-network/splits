/**
 * Pre-Screen Templates V3 Routes — List, Create, Delete
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { PreScreenTemplateRepository } from './repository.js';
import { PreScreenTemplateService } from './service.js';
import { CreateTemplateInput, TemplateListParams, listQuerySchema, createSchema, idParamSchema } from './types.js';

export function registerPreScreenTemplateRoutes(app: FastifyInstance, supabase: SupabaseClient) {
  const repository = new PreScreenTemplateRepository(supabase);
  const service = new PreScreenTemplateService(repository);

  // GET /api/v3/pre-screen-templates — list system + company templates
  app.get('/api/v3/pre-screen-templates', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as TemplateListParams);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // POST /api/v3/pre-screen-templates — create custom template
  app.post('/api/v3/pre-screen-templates', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateTemplateInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // DELETE /api/v3/pre-screen-templates/:id — delete custom template only
  app.delete('/api/v3/pre-screen-templates/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Template deleted successfully' } });
  });
}
