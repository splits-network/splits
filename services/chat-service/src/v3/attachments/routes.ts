/**
 * Attachments V3 Routes -- Core 5 CRUD + Views + Actions
 *
 * Views and actions are registered BEFORE :id routes to avoid collision.
 * POST (create) is handled by the init-upload action.
 * PATCH is not applicable (attachments are immutable after upload).
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../v2/shared/events';
import { IChatEventPublisher } from '../shared/chat-event-publisher';
import { AttachmentRepository } from './repository';
import { AttachmentService } from './service';
import { AttachmentStorageClient } from './storage';
import {
  AttachmentListParams,
  listQuerySchema,
  idParamSchema,
} from './types';

// --- View/Action registrations ---
import { registerInitUploadAction } from './actions/init-upload.route';
import { registerCompleteUploadAction } from './actions/complete-upload.route';
import { registerDownloadView } from './views/download.route';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };

export interface AttachmentRouteDeps {
  supabase: SupabaseClient;
  eventPublisher?: IEventPublisher;
  chatEventPublisher?: IChatEventPublisher;
  attachmentQueue: { addJob(type: string, data: Record<string, any>): Promise<string | void> };
  attachmentsEnabled: boolean;
  attachmentsBucket: string;
}

export function registerAttachmentRoutes(app: FastifyInstance, deps: AttachmentRouteDeps) {
  const {
    supabase,
    eventPublisher,
    chatEventPublisher,
    attachmentQueue,
    attachmentsEnabled,
    attachmentsBucket,
  } = deps;

  const repository = new AttachmentRepository(supabase);
  const service = new AttachmentService(repository, supabase, eventPublisher);
  const storage = new AttachmentStorageClient(supabase, attachmentsBucket);

  // --- Views (before :id) ---
  registerDownloadView(app, supabase, storage, attachmentsEnabled);

  // --- Actions (before :id) ---
  registerInitUploadAction(app, supabase, storage, attachmentsEnabled);
  registerCompleteUploadAction(app, supabase, attachmentQueue, attachmentsEnabled, eventPublisher, chatEventPublisher);

  // --- Core 5 CRUD ---

  // GET /api/v3/chat/attachments
  app.get('/api/v3/chat/attachments', {
    schema: { querystring: listQuerySchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const result = await service.getAll(request.query as AttachmentListParams, clerkUserId);
    reply.header('Cache-Control', 'private, max-age=30');
    return reply.send({ data: result.data, pagination: result.pagination });
  });

  // GET /api/v3/chat/attachments/:id
  app.get('/api/v3/chat/attachments/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    const data = await service.getById(id, clerkUserId);
    reply.header('Cache-Control', 'private, max-age=30');
    return reply.send({ data });
  });

  // POST /api/v3/chat/attachments
  // Creation is handled by POST /actions/init-upload which includes
  // storage URL generation. This core POST exists to satisfy Core 5.
  app.post('/api/v3/chat/attachments', async (_request, reply) => {
    return reply.status(400).send({
      error: {
        code: 'USE_ACTION',
        message: 'Use POST /api/v3/chat/attachments/actions/init-upload to create attachments',
      },
    });
  });

  // PATCH /api/v3/chat/attachments/:id
  // Attachments are immutable after creation -- status is managed by actions.
  app.patch('/api/v3/chat/attachments/:id', {
    schema: { params: idParamSchema },
  }, async (_request, reply) => {
    return reply.status(400).send({
      error: {
        code: 'IMMUTABLE',
        message: 'Attachments cannot be modified. Use actions to change status.',
      },
    });
  });

  // DELETE /api/v3/chat/attachments/:id
  app.delete('/api/v3/chat/attachments/:id', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) return reply.status(401).send(AUTH_ERROR);
    const { id } = request.params as { id: string };
    await service.delete(id, clerkUserId);
    return reply.send({ data: { message: 'Attachment deleted successfully' } });
  });
}
