/**
 * POST /api/v3/chat/attachments/:id/actions/complete-upload
 *
 * Marks an attachment as uploaded and enqueues a malware scan.
 * Requires CHAT_ATTACHMENTS_ENABLED feature flag.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { IEventPublisher } from '../../../v2/shared/events.js';
import { IChatEventPublisher } from '../../shared/chat-event-publisher.js';
import { CompleteUploadRepository } from './complete-upload.repository.js';
import { CompleteUploadService, JobQueue } from './complete-upload.service.js';
import { completeUploadParamsSchema } from '../types.js';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };
const DISABLED_ERROR = { error: { code: 'FEATURE_DISABLED', message: 'Attachments are disabled' } };

export function registerCompleteUploadAction(
  app: FastifyInstance,
  supabase: SupabaseClient,
  attachmentQueue: JobQueue,
  attachmentsEnabled: boolean,
  eventPublisher?: IEventPublisher,
  chatEventPublisher?: IChatEventPublisher,
) {
  const repository = new CompleteUploadRepository(supabase);
  const service = new CompleteUploadService(
    repository, supabase, attachmentQueue, eventPublisher, chatEventPublisher,
  );

  app.post('/api/v3/chat/attachments/:id/actions/complete-upload', {
    schema: { params: completeUploadParamsSchema },
  }, async (request, reply) => {
    if (!attachmentsEnabled) {
      return reply.status(403).send(DISABLED_ERROR);
    }
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send(AUTH_ERROR);
    }
    const { id } = request.params as { id: string };
    const data = await service.execute(id, clerkUserId);
    return reply.send({ data });
  });
}
