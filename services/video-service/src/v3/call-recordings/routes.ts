/**
 * Call Recordings V3 Routes — Core 5 CRUD
 *
 * Flat data only, no joins, no business logic.
 * Views and actions registered BEFORE core :id routes.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { CallRecordingRepository } from './repository';
import { CallRecordingService } from './service';
import {
  CallRecordingListParams,
  CreateCallRecordingInput,
  UpdateCallRecordingInput,
  listQuerySchema,
  createSchema,
  updateSchema,
  idParamSchema,
} from './types';

// View routes
import { registerPlaybackView } from './views/playback.route';

// Action routes
import { registerStartAction } from './actions/start.route';
import { registerStopAction } from './actions/stop.route';
import { registerLivekitWebhookAction } from './actions/livekit-webhook.route';

export interface CallRecordingRoutesConfig {
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
  livekitApiKey: string;
  livekitApiSecret: string;
  livekitWsUrl: string;
  s3Config: {
    endpoint: string;
    region: string;
    accessKey: string;
    secretKey: string;
    bucket: string;
  };
}

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export function registerCallRecordingRoutes(app: FastifyInstance, config: CallRecordingRoutesConfig) {
  const repository = new CallRecordingRepository(config.supabase);
  const service = new CallRecordingService(repository, config.supabase, config.eventPublisher);

  // Register views BEFORE core CRUD (to avoid :id collision)
  registerPlaybackView(app, config.supabase);

  // Register actions BEFORE core CRUD
  registerStartAction(app, config);
  registerStopAction(app, config);
  registerLivekitWebhookAction(app, config);

  // ── Core 5 CRUD ──────────────────────────────────────────────

  // GET /api/v3/call-recordings — list
  app.get('/api/v3/call-recordings', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.getAll(request.query as CallRecordingListParams, clerkUserId, request.headers);
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/call-recordings/:id — read
  app.get('/api/v3/call-recordings/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.getById(id, clerkUserId, request.headers);
    return reply.send({ data });
  });

  // POST /api/v3/call-recordings — create
  app.post('/api/v3/call-recordings', {
    schema: { body: createSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const data = await service.create(request.body as CreateCallRecordingInput, clerkUserId, request.headers);
    return reply.code(201).send({ data });
  });

  // PATCH /api/v3/call-recordings/:id — update
  app.patch('/api/v3/call-recordings/:id', {
    schema: { params: idParamSchema, body: updateSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.update(id, request.body as UpdateCallRecordingInput, clerkUserId, request.headers);
    return reply.send({ data });
  });

  // DELETE /api/v3/call-recordings/:id — delete
  app.delete('/api/v3/call-recordings/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId, request.headers);
    return reply.send({ data: { message: 'Call recording deleted successfully' } });
  });
}
