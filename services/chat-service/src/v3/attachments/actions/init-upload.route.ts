/**
 * POST /api/v3/chat/attachments/actions/init-upload
 *
 * Creates an attachment record and returns a signed upload URL.
 * Requires CHAT_ATTACHMENTS_ENABLED feature flag.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { InitUploadRepository } from './init-upload.repository';
import { InitUploadService } from './init-upload.service';
import { AttachmentStorageClient } from '../storage';
import { InitUploadInput, initUploadSchema } from '../types';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };
const DISABLED_ERROR = { error: { code: 'FEATURE_DISABLED', message: 'Attachments are disabled' } };

export function registerInitUploadAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  storage: AttachmentStorageClient,
  attachmentsEnabled: boolean,
) {
  const repository = new InitUploadRepository(supabase);
  const service = new InitUploadService(repository, storage, supabase);

  app.post('/api/v3/chat/attachments/actions/init-upload', {
    schema: { body: initUploadSchema },
  }, async (request, reply) => {
    if (!attachmentsEnabled) {
      return reply.status(403).send(DISABLED_ERROR);
    }
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send(AUTH_ERROR);
    }
    const idempotencyKey = request.headers['x-idempotency-key'] as string | undefined;
    const result = await service.execute(request.body as InitUploadInput, clerkUserId, idempotencyKey);
    return reply.status(201).send({ data: { ...result.attachment, uploadUrl: result.uploadUrl } });
  });
}
