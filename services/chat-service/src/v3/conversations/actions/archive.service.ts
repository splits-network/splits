/**
 * Archive Action Service
 *
 * Business logic for toggling archive state on a conversation.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ArchiveActionRepository } from './archive.repository';
import { IEventPublisher } from '../../../v2/shared/events';
import { IChatEventPublisher } from '../../shared/chat-event-publisher';
import { resolveAndValidateParticipant } from '../lib/participant-helper';

export class ArchiveActionService {
  constructor(
    private repository: ArchiveActionRepository,
    private supabase: SupabaseClient,
    private eventPublisher?: IEventPublisher,
    private chatEventPublisher?: IChatEventPublisher,
  ) {}

  async archive(
    conversationId: string,
    archived: boolean,
    clerkUserId: string,
  ): Promise<{ message: string }> {
    const { userId } = await resolveAndValidateParticipant(this.supabase, clerkUserId, conversationId);

    await this.repository.updateArchiveState(conversationId, userId, archived);

    await this.chatEventPublisher?.conversationUpdated(userId, { conversationId, archived });

    await this.eventPublisher?.publish('conversation.archived', {
      conversation_id: conversationId,
      user_id: userId,
      archived,
    }, 'chat-service');

    return { message: archived ? 'Conversation archived' : 'Conversation unarchived' };
  }
}
