/**
 * Conversations V3 Service — Business Logic
 *
 * Core conversation CRUD with participant-based access control.
 * No HTTP concepts. Typed errors only.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError, BadRequestError } from '@splits-network/shared-fastify';
import { ConversationRepository } from './repository';
import {
  ConversationListParams,
  CreateConversationInput,
  UpdateConversationInput,
} from './types';
import { IEventPublisher } from '../../v2/shared/events';
import { IChatEventPublisher } from '../shared/chat-event-publisher';

export class ConversationService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: ConversationRepository,
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

  async getAll(params: ConversationListParams, clerkUserId: string) {
    const userId = await this.resolveUserId(clerkUserId);
    const { data, total } = await this.repository.findAll(params, userId);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string, clerkUserId: string) {
    const userId = await this.resolveUserId(clerkUserId);
    const conversation = await this.repository.findById(id);
    if (!conversation) throw new NotFoundError('Conversation', id);

    const isParticipant = await this.repository.isParticipant(id, userId);
    if (!isParticipant) {
      throw new ForbiddenError('You are not a participant in this conversation');
    }
    return conversation;
  }

  async create(input: CreateConversationInput, clerkUserId: string) {
    const userId = await this.resolveUserId(clerkUserId);

    const record = {
      subject: input.subject || null,
      created_by: userId,
    };
    const conversation = await this.repository.create(record);

    // Add creator + other participants
    const allParticipants = [...new Set([userId, ...input.participant_ids])];
    await this.repository.addParticipants(conversation.id, allParticipants);

    await this.eventPublisher?.publish('conversation.created', {
      conversation_id: conversation.id,
      created_by: userId,
      participant_count: allParticipants.length,
    }, 'chat-service');

    // Notify other participants via real-time channel
    const otherParticipants = allParticipants.filter((id) => id !== userId);
    for (const participantId of otherParticipants) {
      await this.chatEventPublisher?.conversationRequested(participantId, {
        conversationId: conversation.id,
        requestedBy: userId,
      });
    }

    return conversation;
  }

  async update(id: string, input: UpdateConversationInput, clerkUserId: string) {
    const userId = await this.resolveUserId(clerkUserId);
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Conversation', id);

    const isParticipant = await this.repository.isParticipant(id, userId);
    if (!isParticipant) {
      throw new ForbiddenError('You are not a participant in this conversation');
    }

    const updated = await this.repository.update(id, input);

    await this.chatEventPublisher?.conversationUpdated(userId, {
      conversationId: id,
      subject: input.subject,
    });

    return updated;
  }

  async archive(id: string, clerkUserId: string) {
    const userId = await this.resolveUserId(clerkUserId);
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Conversation', id);

    const isParticipant = await this.repository.isParticipant(id, userId);
    if (!isParticipant) {
      throw new ForbiddenError('You are not a participant in this conversation');
    }

    await this.repository.softDelete(id);

    await this.chatEventPublisher?.conversationUpdated(userId, {
      conversationId: id,
      archived: true,
    });
  }
}
