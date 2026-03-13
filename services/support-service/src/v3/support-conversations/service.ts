/**
 * Support Conversations V3 Service — Business Logic
 *
 * Optional auth (visitors may not be logged in).
 * No HTTP concepts. Typed errors only.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { NotFoundError, BadRequestError } from '@splits-network/shared-fastify';
import { SupportConversationRepository } from './repository';
import {
  SupportConversationListParams,
  CreateSupportConversationInput,
  UpdateSupportConversationInput,
} from './types';
import { IEventPublisher } from '../../v2/shared/events';

export class SupportConversationService {
  constructor(
    private repository: SupportConversationRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
  ) {}

  async getAll(params: SupportConversationListParams) {
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string) {
    const conversation = await this.repository.findById(id);
    if (!conversation) throw new NotFoundError('SupportConversation', id);
    return conversation;
  }

  async create(input: CreateSupportConversationInput, clerkUserId?: string) {
    const record = {
      session_id: input.session_id,
      clerk_user_id: clerkUserId || null,
      visitor_name: input.visitor_name || null,
      visitor_email: input.visitor_email || null,
      source_app: input.source_app || null,
      status: 'open',
    };

    const conversation = await this.repository.create(record);

    await this.eventPublisher?.publish('support_conversation.created', {
      conversation_id: conversation.id,
      session_id: conversation.session_id,
    }, 'support-service');

    return conversation;
  }

  async update(id: string, input: UpdateSupportConversationInput) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('SupportConversation', id);
    return this.repository.update(id, input);
  }

  async close(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('SupportConversation', id);
    await this.repository.softDelete(id);
  }

  async getBySession(sessionId: string) {
    return this.repository.findBySession(sessionId);
  }
}
