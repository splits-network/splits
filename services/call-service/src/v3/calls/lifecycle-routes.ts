/**
 * Call Lifecycle V3 Routes — State transition endpoints
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events.js';
import { CallRepository } from './repository.js';
import { CallLifecycleService } from './lifecycle-service.js';
import { idParamSchema } from './types.js';

const rescheduleBodySchema = {
  type: 'object',
  required: ['scheduled_at'],
  properties: {
    scheduled_at: { type: 'string' },
  },
  additionalProperties: false,
};

const cancelBodySchema = {
  type: 'object',
  properties: {
    reason: { type: 'string', maxLength: 1000 },
  },
  additionalProperties: false,
};

function requireAuth(request: any, reply: any): string | null {
  const clerkUserId = request.headers['x-clerk-user-id'] as string;
  if (!clerkUserId) {
    reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    return null;
  }
  return clerkUserId;
}

export function registerCallLifecycleRoutes(
  app: FastifyInstance,
  supabase: SupabaseClient,
  eventPublisher: IEventPublisher,
) {
  const repository = new CallRepository(supabase);
  const lifecycle = new CallLifecycleService(repository, supabase, eventPublisher);

  // POST /api/v3/calls/:id/start
  app.post('/api/v3/calls/:id/start', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = requireAuth(request, reply);
    if (!clerkUserId) return;
    const { id } = request.params as { id: string };
    const data = await lifecycle.startCall(id);
    return reply.send({ data });
  });

  // POST /api/v3/calls/:id/end
  app.post('/api/v3/calls/:id/end', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = requireAuth(request, reply);
    if (!clerkUserId) return;
    const { id } = request.params as { id: string };
    const data = await lifecycle.endCall(id);
    return reply.send({ data });
  });

  // POST /api/v3/calls/:id/cancel
  app.post('/api/v3/calls/:id/cancel', {
    schema: { params: idParamSchema, body: cancelBodySchema },
  }, async (request, reply) => {
    const clerkUserId = requireAuth(request, reply);
    if (!clerkUserId) return;
    const { id } = request.params as { id: string };
    const body = request.body as { reason?: string };
    const data = await lifecycle.cancelCall(id, clerkUserId, body.reason);
    return reply.send({ data });
  });

  // POST /api/v3/calls/:id/reschedule
  app.post('/api/v3/calls/:id/reschedule', {
    schema: { params: idParamSchema, body: rescheduleBodySchema },
  }, async (request, reply) => {
    const clerkUserId = requireAuth(request, reply);
    if (!clerkUserId) return;
    const { id } = request.params as { id: string };
    const body = request.body as { scheduled_at: string };
    const data = await lifecycle.rescheduleCall(id, body.scheduled_at, clerkUserId);
    return reply.send({ data });
  });

  // POST /api/v3/calls/:id/decline
  app.post('/api/v3/calls/:id/decline', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = requireAuth(request, reply);
    if (!clerkUserId) return;
    const { id } = request.params as { id: string };
    await lifecycle.declineCall(id, clerkUserId);
    return reply.send({ data: { message: 'Call declined successfully' } });
  });
}
