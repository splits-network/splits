/**
 * Conversations V3 Service -- Core CRUD Business Logic
 *
 * Participant-based access control. No HTTP concepts. Typed errors only.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError, BadRequestError } from '@splits-network/shared-fastify';
import { ConversationRepository } from './repository.js';
import { ConversationListParams, UpdateConversationInput } from './types.js';
import { IEventPublisher } from '../../v2/shared/events.js';
import { IChatEventPublisher } from '../shared/chat-event-publisher.js';

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

  async delete(id: string, clerkUserId: string) {
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
      deleted: true,
    });
  }
}
