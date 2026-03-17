/**
 * Init Upload Action Service
 *
 * Creates an attachment record and returns a signed upload URL.
 * Validates that the user is a participant in the conversation
 * and that the conversation request state allows attachments.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError, ForbiddenError } from '@splits-network/shared-fastify';
import { InitUploadRepository } from './init-upload.repository';
import { AttachmentStorageClient } from '../storage';
import { InitUploadInput, ChatAttachment } from '../types';

export interface InitUploadResult {
  attachment: ChatAttachment;
  uploadUrl: string;
}

export class InitUploadService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: InitUploadRepository,
    private storage: AttachmentStorageClient,
    private supabase: SupabaseClient,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async execute(
    input: InitUploadInput,
    clerkUserId: string,
    idempotencyKey?: string,
  ): Promise<InitUploadResult> {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) {
      throw new Error('Unable to resolve identity user');
    }

    // Idempotency: return existing attachment if key matches
    if (idempotencyKey) {
      const existing = await this.repository.findByIdempotencyKey(idempotencyKey);
      if (existing) {
        const uploadUrl = await this.storage.createSignedUploadUrl(existing.storage_key);
        return { attachment: existing, uploadUrl };
      }
    }

    // Verify participant access
    const participant = await this.repository.getParticipantState(
      input.conversation_id,
      context.identityUserId,
    );
    if (!participant) {
      throw new ForbiddenError('Conversation access denied');
    }
    if (participant.request_state === 'pending') {
      throw new BadRequestError('Accept this request before uploading attachments');
    }
    if (participant.request_state === 'declined') {
      throw new BadRequestError('Conversation declined');
    }

    // Generate storage key
    const attachmentId = randomUUID();
    const storageKey = `${input.conversation_id}/${attachmentId}-${input.file_name}`;

    // Create attachment record
    const attachment = await this.repository.createAttachment({
      conversation_id: input.conversation_id,
      uploader_id: context.identityUserId,
      file_name: input.file_name,
      content_type: input.content_type,
      size_bytes: input.size_bytes,
      storage_key: storageKey,
      idempotency_key: idempotencyKey ?? null,
    });

    // Generate signed upload URL
    const uploadUrl = await this.storage.createSignedUploadUrl(storageKey);

    return { attachment, uploadUrl };
  }
}
