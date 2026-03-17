/**
 * Complete Upload Action Service
 *
 * Marks an attachment as uploaded and enqueues a malware scan job.
 * Only the original uploader can complete the upload.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { CompleteUploadRepository } from './complete-upload.repository';
import { IChatEventPublisher } from '../../shared/chat-event-publisher';
import { IEventPublisher } from '../../../v2/shared/events';
import { ChatAttachment } from '../types';

export interface JobQueue {
  addJob(type: string, data: Record<string, any>): Promise<string | void>;
}

export class CompleteUploadService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: CompleteUploadRepository,
    private supabase: SupabaseClient,
    private attachmentQueue: JobQueue,
    private eventPublisher?: IEventPublisher,
    private chatEventPublisher?: IChatEventPublisher,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async execute(id: string, clerkUserId: string): Promise<ChatAttachment> {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) {
      throw new Error('Unable to resolve identity user');
    }

    const attachment = await this.repository.findById(id);
    if (!attachment) {
      throw new NotFoundError('Attachment', id);
    }
    if (attachment.uploader_id !== context.identityUserId) {
      throw new ForbiddenError('Attachment not found or access denied');
    }

    // Transition to pending_scan
    const updated = await this.repository.markPendingScan(id);

    // Enqueue malware scan job
    await this.attachmentQueue.addJob('scan-attachment', {
      attachmentId: updated.id,
      storageKey: updated.storage_key,
      conversationId: updated.conversation_id,
      uploaderId: updated.uploader_id,
    });

    // Real-time event
    await this.chatEventPublisher?.attachmentUpdated(updated.conversation_id, {
      attachmentId: updated.id,
      status: updated.status,
    });

    // Domain event for audit trail
    await this.eventPublisher?.publish('chat.attachment.uploaded', {
      attachment_id: updated.id,
      conversation_id: updated.conversation_id,
      uploader_id: updated.uploader_id,
      file_name: updated.file_name,
      content_type: updated.content_type,
      size_bytes: updated.size_bytes,
    }, 'chat-service');

    return updated;
  }
}
