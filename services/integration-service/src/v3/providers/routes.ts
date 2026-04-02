/**
 * Providers V3 Routes — Read-only catalog
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { ProviderRepository } from './repository.js';
import { ProviderService } from './service.js';
import { ProviderListParams, slugParamSchema, listQuerySchema } from './types.js';

export function registerProviderRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
) {
  const repository = new ProviderRepository(supabase);
  const service = new ProviderService(repository);

  // GET /api/v3/integrations/providers
  app.get('/api/v3/integrations/providers', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const result = await service.getAll(request.query as ProviderListParams);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/integrations/providers/:slug
  app.get('/api/v3/integrations/providers/:slug', {
    schema: { params: slugParamSchema },
  }, async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const data = await service.getBySlug(slug);
    return reply.send({ data });
  });
}
