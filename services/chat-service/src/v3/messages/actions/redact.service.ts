/**
 * Redact Action Service
 *
 * Business logic for admin message redaction.
 * Only platform admins can redact messages.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { RedactActionRepository } from './redact.repository.js';
import { IEventPublisher } from '../../../v2/shared/events.js';
import { IChatEventPublisher } from '../../shared/chat-event-publisher.js';

export interface RedactInput {
  reason?: string | null;
  edited_body?: string | null;
}

export class RedactActionService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: RedactActionRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
    private chatEventPublisher?: IChatEventPublisher,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async redact(messageId: string, input: RedactInput, clerkUserId: string): Promise<any> {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Admin privileges required');
    }

    const message = await this.repository.findById(messageId);
    if (!message) {
      throw new NotFoundError('Message', messageId);
    }

    const now = new Date().toISOString();
    const payload: {
      body?: string | null;
      edited_at?: string;
      redacted_at: string;
      redaction_reason: string | null;
    } = {
      redacted_at: now,
      redaction_reason: input.reason ?? null,
    };

    if (typeof input.edited_body !== 'undefined') {
      payload.body = input.edited_body;
      payload.edited_at = now;
    }

    const updated = await this.repository.redact(messageId, payload);

    // Real-time: notify conversation that message was updated
    await this.chatEventPublisher?.messageUpdated(message.conversation_id, {
      messageId: updated.id,
      conversationId: message.conversation_id,
    });

    // Domain event for audit trail
    await this.eventPublisher?.publish('chat.message.redacted', {
      message_id: messageId,
      conversation_id: message.conversation_id,
      redacted_by: context.identityUserId,
      reason: input.reason ?? null,
    }, 'chat-service');

    return updated;
  }
}
