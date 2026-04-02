/**
 * Accept Action Service
 *
 * Business logic for accepting a conversation request.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AcceptActionRepository } from './accept.repository.js';
import { IEventPublisher } from '../../../v2/shared/events.js';
import { IChatEventPublisher } from '../../shared/chat-event-publisher.js';
import { resolveAndValidateParticipant } from '../lib/participant-helper.js';

export class AcceptActionService {
  constructor(
    private repository: AcceptActionRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
    private chatEventPublisher?: IChatEventPublisher,
  ) {}

  async accept(conversationId: string, clerkUserId: string): Promise<{ message: string }> {
    const { userId } = await resolveAndValidateParticipant(this.supabase, clerkUserId, conversationId);

    await this.repository.updateRequestState(conversationId, userId);

    const other = await this.repository.findOtherParticipant(conversationId, userId);
    if (other) {
      await this.chatEventPublisher?.conversationAccepted(other.user_id, {
        conversationId,
        acceptedBy: userId,
      });
    }

    await this.eventPublisher?.publish('conversation.accepted', {
      conversation_id: conversationId,
      accepted_by: userId,
    }, 'chat-service');

    return { message: 'Conversation accepted' };
  }
}
