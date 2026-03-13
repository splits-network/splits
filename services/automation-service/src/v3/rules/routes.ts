/**
 * Automation Rules V3 Routes — Core 5 CRUD
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { RuleRepository } from './repository';
import { RuleService } from './service';
import { CreateRuleInput, UpdateRuleInput, RuleListParams, idParamSchema, listQuerySchema, createRuleSchema, updateRuleSchema } from './types';

export function registerRuleRoutes(app: FastifyInstance, supabase: SupabaseClient, eventPublisher?: IEventPublisher) {
  const repository = new RuleRepository(supabase);
  const service = new RuleService(repository, supabase, eventPublisher);

  app.get('/api/v3/automation-rules', { schema: { querystring: listQuerySchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const result = await service.getAll(request.query as RuleListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  app.get('/api/v3/automation-rules/:id', { schema: { params: idParamSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const { id } = request.params as { id: string };
    const data = await service.getById(id, clerkUserId);
    return reply.send({ data });
  });

  app.post('/api/v3/automation-rules', { schema: { body: createRuleSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const data = await service.create(request.body as CreateRuleInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  app.patch('/api/v3/automation-rules/:id', { schema: { params: idParamSchema, body: updateRuleSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateRuleInput, clerkUserId);
    return reply.send({ data });
  });

  app.delete('/api/v3/automation-rules/:id', { schema: { params: idParamSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Automation rule deleted successfully' } });
  });
}
