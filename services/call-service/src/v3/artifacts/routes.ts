/**
 * Call Artifacts V3 Routes
 * Entity links and tags under /api/v3/calls/:callId/entities and /api/v3/calls/tags
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { ArtifactRepository } from './repository';
import { ArtifactService } from './service';
import {
  AddEntityLinkInput, ArtifactListParams,
  callIdParamSchema, entityLinkIdParamSchema,
  listQuerySchema, addEntityLinkSchema,
} from './types';

export function registerArtifactRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
) {
  const repository = new ArtifactRepository(supabase);
  const service = new ArtifactService(repository, supabase, eventPublisher);

  // GET /api/v3/calls/tags — before :id routes
  app.get('/api/v3/calls/tags', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.listTags(clerkUserId);
    return reply.send({ data });
  });

  // GET /api/v3/calls/:callId/entities
  app.get('/api/v3/calls/:callId/entities', {
    schema: { params: callIdParamSchema, querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { callId } = request.params as { callId: string };
    const result = await service.getEntityLinks(callId, request.query as ArtifactListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // POST /api/v3/calls/:callId/entities
  app.post('/api/v3/calls/:callId/entities', {
    schema: { params: callIdParamSchema, body: addEntityLinkSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { callId } = request.params as { callId: string };
    const data = await service.createEntityLink(callId, request.body as AddEntityLinkInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // DELETE /api/v3/calls/:callId/entities/:id
  app.delete('/api/v3/calls/:callId/entities/:id', {
    schema: { params: entityLinkIdParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { callId, id } = request.params as { callId: string; id: string };
    await service.deleteEntityLink(callId, id, clerkUserId);
    return reply.send({ data: { message: 'Entity link removed successfully' } });
  });
}
