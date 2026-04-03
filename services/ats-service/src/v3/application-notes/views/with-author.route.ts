/**
 * GET /api/v3/application-notes/views/with-author — notes with author info
 * GET /api/v3/application-notes/:id/view/with-author — single note with author
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../../v2/shared/events.js';
import { WithAuthorNoteRepository } from './with-author.repository.js';
import { ApplicationNoteService } from '../service.js';
import { ApplicationNoteRepository } from '../repository.js';
import {
  ApplicationNoteListParams,
  listQuerySchema,
  idParamSchema,
} from '../types.js';

export function registerWithAuthorView(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const viewRepository = new WithAuthorNoteRepository(supabase);
  const crudRepository = new ApplicationNoteRepository(supabase);
  const service = new ApplicationNoteService(crudRepository, supabase, eventPublisher);

  // GET /api/v3/application-notes/views/with-author — list with author join
  app.get('/api/v3/application-notes/views/with-author', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    // Reuse the service's scoping logic to get scope filters
    const scopeFilters = await service.resolveScopeFilters(
      request.query as ApplicationNoteListParams,
      clerkUserId
    );

    const params = request.query as ApplicationNoteListParams;
    const { data, total } = await viewRepository.findAll(params, scopeFilters);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 100);
    return reply.send({
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    });
  });

  // GET /api/v3/application-notes/:id/view/with-author — single with author
  app.get('/api/v3/application-notes/:id/view/with-author', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }

    const { id } = request.params as { id: string };

    // Use view repo for the joined data, but validate access via service
    await service.getById(id, clerkUserId);
    const data = await viewRepository.findById(id);
    return reply.send({ data });
  });
}
