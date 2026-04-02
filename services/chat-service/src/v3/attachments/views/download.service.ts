/**
 * Download View Service
 *
 * Generates a signed download URL for an attachment.
 * Verifies the requesting user is a participant in the conversation.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { DownloadViewRepository } from './download.repository.js';
import { AttachmentStorageClient } from '../storage.js';

export class DownloadViewService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: DownloadViewRepository,
    private storage: AttachmentStorageClient,
    private supabase: SupabaseClient,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getDownloadUrl(id: string, clerkUserId: string): Promise<{ url: string }> {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) {
      throw new Error('Unable to resolve identity user');
    }

    const attachment = await this.repository.findById(id);
    if (!attachment) {
      throw new NotFoundError('Attachment', id);
    }

    // Verify user is a participant in the conversation
    const isParticipant = await this.repository.isParticipant(
      attachment.conversation_id,
      context.identityUserId,
    );
    if (!isParticipant) {
      throw new ForbiddenError('Conversation access denied');
    }

    const downloadUrl = await this.storage.createSignedDownloadUrl(attachment.storage_key);
    return { url: downloadUrl };
  }
}
