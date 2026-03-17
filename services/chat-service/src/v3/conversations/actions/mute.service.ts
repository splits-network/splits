/**
 * Mute Action Service
 *
 * Business logic for toggling mute state on a conversation.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { MuteActionRepository } from './mute.repository';
import { IEventPublisher } from '../../../v2/shared/events';
import { IChatEventPublisher } from '../../shared/chat-event-publisher';
import { resolveAndValidateParticipant } from '../lib/participant-helper';

export class MuteActionService {
  constructor(
    private repository: MuteActionRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
    private chatEventPublisher?: IChatEventPublisher,
  ) {}

  async mute(
    conversationId: string,
    muted: boolean,
    clerkUserId: string,
  ): Promise<{ message: string }> {
    const { userId } = await resolveAndValidateParticipant(this.supabase, clerkUserId, conversationId);

    await this.repository.updateMuteState(conversationId, userId, muted);

    await this.chatEventPublisher?.conversationUpdated(userId, { conversationId, muted });

    await this.eventPublisher?.publish('conversation.muted', {
      conversation_id: conversationId,
      user_id: userId,
      muted,
    }, 'chat-service');

    return { message: muted ? 'Conversation muted' : 'Conversation unmuted' };
  }
}
