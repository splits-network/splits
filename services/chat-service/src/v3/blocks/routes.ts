/**
 * Blocks V3 Routes -- Core 5 CRUD
 *
 * Resource: chat_user_blocks
 * No views or actions needed -- blocks are simple flat records.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { IChatEventPublisher } from '../shared/chat-event-publisher';
import { BlockRepository } from './repository';
import { BlockService } from './service';
import {
  BlockListParams,
  CreateBlockInput,
  listQuerySchema,
  createBlockSchema,
  idParamSchema,
} from './types';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

function getClerkUserId(request: any): string | null {
  return (request.headers['x-clerk-user-id'] as string) || null;
}

export function registerBlockRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher,
  chatEventPublisher?: IChatEventPublisher,
) {
  const repository = new BlockRepository(supabase);
  const service = new BlockService(repository, supabase, eventPublisher, chatEventPublisher);

  // GET /api/v3/chat/blocks -- list blocks for current user
  app.get('/api/v3/chat/blocks', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.getAll(request.query as BlockListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/chat/blocks/:id -- get a specific block
  app.get('/api/v3/chat/blocks/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.getById(id, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/chat/blocks -- create a block
  app.post('/api/v3/chat/blocks', {
    schema: { body: createBlockSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const data = await service.create(request.body as CreateBlockInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/chat/blocks/:id -- blocks are immutable, not supported
  app.patch('/api/v3/chat/blocks/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    return reply.status(400).send({
      error: {
        code: 'NOT_SUPPORTED',
        message: 'Blocks cannot be updated. Delete and recreate instead.',
      },
    });
  });

  // DELETE /api/v3/chat/blocks/:id -- unblock a user
  app.delete('/api/v3/chat/blocks/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = getClerkUserId(request);
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Block removed successfully' } });
  });
}
