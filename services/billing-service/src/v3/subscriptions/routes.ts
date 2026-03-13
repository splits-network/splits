/**
 * Subscriptions V3 Routes
 *
 * Non-parameterized routes registered BEFORE :id routes.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { SubscriptionRepository } from './repository';
import { SubscriptionService } from './service';
import {
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  SubscriptionListParams,
  SetupIntentRequest,
  ActivateSubscriptionRequest,
  UpdatePaymentMethodRequest,
  listQuerySchema,
  createSchema,
  updateSchema,
  setupIntentSchema,
  activateSchema,
  updatePaymentMethodSchema,
  invoicesQuerySchema,
  idParamSchema,
} from './types';

export function registerSubscriptionRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher?: IEventPublisher
) {
  const repository = new SubscriptionRepository(supabase);
  const service = new SubscriptionService(repository, supabase, eventPublisher);

  // --- Non-parameterized routes FIRST ---

  // GET /api/v3/subscriptions/me
  app.get('/api/v3/subscriptions/me', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.getMySubscription(clerkUserId);
    return reply.send({ data });
  });

  // GET /api/v3/subscriptions/payment-methods
  app.get('/api/v3/subscriptions/payment-methods', async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.getPaymentMethods(clerkUserId);
    return reply.send({ data });
  });

  // GET /api/v3/subscriptions/invoices
  app.get('/api/v3/subscriptions/invoices', {
    schema: { querystring: invoicesQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const query = request.query as { limit?: number };
    const data = await service.getInvoices(clerkUserId, query.limit || 10);
    return reply.send({ data });
  });

  // POST /api/v3/subscriptions/setup-intent
  app.post('/api/v3/subscriptions/setup-intent', {
    schema: { body: setupIntentSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.createSetupIntent(request.body as SetupIntentRequest, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/subscriptions/activate
  app.post('/api/v3/subscriptions/activate', {
    schema: { body: activateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.activateSubscription(request.body as ActivateSubscriptionRequest, clerkUserId);
    return reply.code(201).send({ data });
  });

  // POST /api/v3/subscriptions/update-payment-method
  app.post('/api/v3/subscriptions/update-payment-method', {
    schema: { body: updatePaymentMethodSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const body = request.body as UpdatePaymentMethodRequest;
    const data = await service.updatePaymentMethod(clerkUserId, body.payment_method_id);
    return reply.send({ data });
  });

  // --- Standard CRUD ---

  // GET /api/v3/subscriptions — list
  app.get('/api/v3/subscriptions', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const result = await service.getAll(request.query as SubscriptionListParams, clerkUserId);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/subscriptions/:id
  app.get('/api/v3/subscriptions/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.getById(id, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/subscriptions — create
  app.post('/api/v3/subscriptions', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const data = await service.create(request.body as CreateSubscriptionInput, clerkUserId);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/subscriptions/:id — update
  app.patch('/api/v3/subscriptions/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateSubscriptionInput, clerkUserId);
    return reply.send({ data });
  });

  // DELETE /api/v3/subscriptions/:id — cancel
  app.delete('/api/v3/subscriptions/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    const { id } = request.params as { id: string };
    const data = await service.cancel(id, clerkUserId);
    return reply.send({ data });
  });
}
