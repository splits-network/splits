/**
 * Attachments V3 Service -- Core CRUD Business Logic
 *
 * Handles flat CRUD operations. Complex operations (init-upload, complete-upload)
 * are handled by dedicated action services.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError } from '@splits-network/shared-fastify';
import { AttachmentRepository } from './repository';
import { AttachmentListParams, ChatAttachment } from './types';
import { IEventPublisher } from '../../v2/shared/events';

export class AttachmentService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: AttachmentRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: AttachmentListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) {
      throw new Error('Unable to resolve identity user');
    }

    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string, clerkUserId: string): Promise<ChatAttachment> {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) {
      throw new Error('Unable to resolve identity user');
    }

    const attachment = await this.repository.findById(id);
    if (!attachment) {
      throw new NotFoundError('Attachment', id);
    }

    return attachment;
  }

  async delete(id: string, clerkUserId: string): Promise<void> {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) {
      throw new Error('Unable to resolve identity user');
    }

    const attachment = await this.repository.findById(id);
    if (!attachment) {
      throw new NotFoundError('Attachment', id);
    }

    await this.repository.softDelete(id);

    await this.eventPublisher?.publish('chat.attachment.deleted', {
      attachment_id: id,
      conversation_id: attachment.conversation_id,
      deleted_by: context.identityUserId,
    }, 'chat-service');
  }
}
