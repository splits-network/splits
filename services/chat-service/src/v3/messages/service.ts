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

    const participant = await this.repository.getParticipantState(conversationId, userId);
    if (!participant) {
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

    // 1. Verify sender is a participant and check their request state
    const senderParticipant = await this.repository.getParticipantState(conversationId, userId);
    if (!senderParticipant) {
      throw new ForbiddenError('You are not a participant in this conversation');
    }
    if (senderParticipant.request_state === 'pending') {
      throw new BadRequestError('Accept this request to reply');
    }
    if (senderParticipant.request_state === 'declined') {
      throw new BadRequestError('Conversation declined');
    }

    // 2. Get the other participant and validate their state
    const otherParticipant = await this.repository.getOtherParticipant(conversationId, userId);
    if (!otherParticipant) {
      throw new BadRequestError('Conversation participant missing');
    }
    if (otherParticipant.archived_at) {
      throw new BadRequestError('Recipient archived this conversation');
    }
    if (otherParticipant.request_state === 'declined') {
      throw new BadRequestError('Conversation declined');
    }

    // 3. Check blocks between sender and recipient
    const blocked = await this.repository.isBlocked(userId, otherParticipant.user_id);
    if (blocked) {
      throw new BadRequestError('Message could not be delivered');
    }

    // 4. Pending request message limit (max 1 message when recipient hasn't accepted)
    if (otherParticipant.request_state === 'pending') {
      const messageCount = await this.repository.countMessages(conversationId);
      if (messageCount >= 1) {
        throw new BadRequestError('Request pending; cannot send additional messages');
      }
    }

    // 5. Send via atomic RPC (handles insert + last_message_at update)
    try {
      const message = await this.repository.sendViaRpc(
        conversationId,
        userId,
        input.body,
        input.client_message_id ?? null,
      );

      // Real-time: notify conversation channel
      await this.chatEventPublisher?.messageCreated(conversationId, {
        conversationId,
        messageId: message.id,
        senderId: userId,
        createdAt: message.created_at,
      });

      // Real-time: notify other participant via user channel
      await this.chatEventPublisher?.conversationUpdated(otherParticipant.user_id, {
        conversationId,
        lastMessageId: message.id,
        lastMessageAt: message.created_at,
      });

      // Domain event for downstream consumers (notifications, etc.)
      await this.eventPublisher?.publish('chat.message.created', {
        conversation_id: conversationId,
        message_id: message.id,
        sender_user_id: userId,
        recipient_user_id: otherParticipant.user_id,
        created_at: message.created_at,
        body_preview: input.body.slice(0, 140),
      }, 'chat-service');

      return message;
    } catch (error: any) {
      // Idempotency: handle unique constraint on client_message_id
      if (error?.code === '23505' && input.client_message_id) {
        const existing = await this.repository.findByClientMessageId(userId, input.client_message_id);
        if (existing) return existing;
      }
      throw error;
    }
  }
}
