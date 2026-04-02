/**
 * GET /api/v3/chat/attachments/:id/view/download
 *
 * Returns a signed download URL for the attachment.
 * Requires CHAT_ATTACHMENTS_ENABLED feature flag.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { DownloadViewRepository } from './download.repository.js';
import { DownloadViewService } from './download.service.js';
import { AttachmentStorageClient } from '../storage.js';
import { idParamSchema } from '../types.js';

const AUTH_ERROR = { error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } };
const DISABLED_ERROR = { error: { code: 'FEATURE_DISABLED', message: 'Attachments are disabled' } };

export function registerDownloadView(
  app: FastifyInstance,
  supabase: SupabaseClient,
  storage: AttachmentStorageClient,
  attachmentsEnabled: boolean,
) {
  const repository = new DownloadViewRepository(supabase);
  const service = new DownloadViewService(repository, storage, supabase);

  app.get('/api/v3/chat/attachments/:id/view/download', {
    schema: { params: idParamSchema },
  }, async (request, reply) => {
    if (!attachmentsEnabled) {
      return reply.status(403).send(DISABLED_ERROR);
    }
    const clerkUserId = request.headers['x-clerk-user-id'] as string;
    if (!clerkUserId) {
      return reply.status(401).send(AUTH_ERROR);
    }
    const { id } = request.params as { id: string };
    const data = await service.getDownloadUrl(id, clerkUserId);
    return reply.send({ data });
  });
}
