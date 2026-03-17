/**
 * Messages V3 Service — Business Logic
 *
 * Message CRUD with participant-based access control and real-time events.
 * No HTTP concepts. Typed errors only.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError, BadRequestError } from '@splits-network/shared-fastify';
import { MessageRepository } from './repository';
import { MessageListParams, SendMessageInput } from './types';
import { IEventPublisher } from '../../v2/shared/events';
import { IChatEventPublisher } from '../shared/chat-event-publisher';

export class MessageService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: MessageRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
    private chatEventPublisher?: IChatEventPublisher,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  private async resolveUserId(clerkUserId: string): Promise<string> {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) {
      throw new BadRequestError('User identity not found');
    }
    return context.identityUserId;
  }

  async getAll(conversationId: string, params: MessageListParams, clerkUserId: string) {
    const userId = await this.resolveUserId(clerkUserId);

    const isParticipant = await this.repository.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new ForbiddenError('You are not a participant in this conversation');
    }

    const { data, total } = await this.repository.findAll(conversationId, params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async send(conversationId: string, input: SendMessageInput, clerkUserId: string) {
    const userId = await this.resolveUserId(clerkUserId);

    const isParticipant = await this.repository.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new ForbiddenError('You are not a participant in this conversation');
    }

    // Idempotency: check for duplicate client_message_id
    if (input.client_message_id) {
      const existing = await this.repository.findByClientMessageId(userId, input.client_message_id);
      if (existing) return existing;
    }

    const record: Record<string, any> = {
      conversation_id: conversationId,
      sender_id: userId,
      body: input.body,
      kind: 'user',
    };
    if (input.client_message_id) record.client_message_id = input.client_message_id;
    if (input.reply_to_message_id) record.reply_to_message_id = input.reply_to_message_id;

    const message = await this.repository.create(record);

    // Real-time: notify conversation channel
    await this.chatEventPublisher?.messageCreated(conversationId, {
      conversationId,
      messageId: message.id,
      senderId: userId,
      createdAt: message.created_at,
    });

    // Real-time: notify other participants via user channel
    const otherParticipants = await this.repository.getOtherParticipants(conversationId, userId);
    for (const participantId of otherParticipants) {
      await this.chatEventPublisher?.conversationUpdated(participantId, {
        conversationId,
        lastMessageId: message.id,
        lastMessageAt: message.created_at,
      });
    }

    // Domain event for downstream consumers (notifications, etc.)
    await this.eventPublisher?.publish('chat.message.created', {
      conversation_id: conversationId,
      message_id: message.id,
      sender_user_id: userId,
      recipient_user_ids: otherParticipants,
      created_at: message.created_at,
      body_preview: input.body.slice(0, 140),
    }, 'chat-service');

    return message;
  }
}
