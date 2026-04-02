/**
 * Decline Action Service
 *
 * Business logic for declining a conversation request. Also archives it for the decliner.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { DeclineActionRepository } from './decline.repository.js';
import { IEventPublisher } from '../../../v2/shared/events.js';
import { IChatEventPublisher } from '../../shared/chat-event-publisher.js';
import { resolveAndValidateParticipant } from '../lib/participant-helper.js';

export class DeclineActionService {
  constructor(
    private repository: DeclineActionRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
    private chatEventPublisher?: IChatEventPublisher,
  ) {}

  async decline(conversationId: string, clerkUserId: string): Promise<{ message: string }> {
    const { userId } = await resolveAndValidateParticipant(this.supabase, clerkUserId, conversationId);

    await this.repository.updateRequestState(conversationId, userId);

    const other = await this.repository.findOtherParticipant(conversationId, userId);
    if (other) {
      await this.chatEventPublisher?.conversationDeclined(other.user_id, {
        conversationId,
        declinedBy: userId,
      });
    }

    await this.eventPublisher?.publish('conversation.declined', {
      conversation_id: conversationId,
      declined_by: userId,
    }, 'chat-service');

    return { message: 'Conversation declined' };
  }
}
