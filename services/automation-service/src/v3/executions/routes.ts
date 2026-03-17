/**
 * Automation Executions V3 Routes — GET list, GET by id, PATCH
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { ExecutionRepository } from './repository';
import { ExecutionService } from './service';
import { ExecutionListParams, idParamSchema, listQuerySchema } from './types';

export function registerExecutionRoutes(app: FastifyInstance, supabase: SupabaseClient, eventPublisher?: IEventPublisher) {
  const repository = new ExecutionRepository(supabase);
  const service = new ExecutionService(repository, supabase, eventPublisher);

  app.get('/api/v3/automation-executions', { schema: { querystring: listQuerySchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const result = await service.getAll(request.query as ExecutionListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  app.get('/api/v3/automation-executions/:id', { schema: { params: idParamSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const { id } = request.params as { id: string };
    const data = await service.getById(id, clerkUserId);
    return reply.send({ data });
  });

  app.patch('/api/v3/automation-executions/:id', { schema: { params: idParamSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as Record<string, any>, clerkUserId);
    return reply.send({ data });
  });
}
