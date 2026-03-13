/**
 * Fraud Signals V3 Routes — Core 5 CRUD
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { FraudSignalRepository } from './repository';
import { FraudSignalService } from './service';
import { CreateFraudSignalInput, UpdateFraudSignalInput, FraudSignalListParams, idParamSchema, listQuerySchema, createFraudSignalSchema, updateFraudSignalSchema } from './types';

export function registerFraudSignalRoutes(app: FastifyInstance, supabase: SupabaseClient, eventPublisher?: IEventPublisher) {
  const repository = new FraudSignalRepository(supabase);
  const service = new FraudSignalService(repository, supabase, eventPublisher);

  app.get('/api/v3/fraud-signals', { schema: { querystring: listQuerySchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const result = await service.getAll(request.query as FraudSignalListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  app.get('/api/v3/fraud-signals/:id', { schema: { params: idParamSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const data = await service.getById((request.params as { id: string }).id, clerkUserId);
    return reply.send({ data });
  });

  app.post('/api/v3/fraud-signals', { schema: { body: createFraudSignalSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const data = await service.create(request.body as CreateFraudSignalInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  app.patch('/api/v3/fraud-signals/:id', { schema: { params: idParamSchema, body: updateFraudSignalSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const data = await service.update((request.params as { id: string }).id, request.body as UpdateFraudSignalInput, clerkUserId);
    return reply.send({ data });
  });

  app.delete('/api/v3/fraud-signals/:id', { schema: { params: idParamSchema } }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    await service.delete((request.params as { id: string }).id, clerkUserId);
    return reply.send({ data: { message: 'Fraud signal deleted successfully' } });
  });
}
