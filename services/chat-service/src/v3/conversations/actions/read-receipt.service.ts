/**
 * Read Receipt Action Service
 *
 * Business logic for updating the read receipt for a conversation participant.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ReadReceiptActionRepository } from './read-receipt.repository';
import { IChatEventPublisher } from '../../shared/chat-event-publisher';
import { resolveAndValidateParticipant } from '../lib/participant-helper';

export class ReadReceiptActionService {
  constructor(
    private repository: ReadReceiptActionRepository,
    private supabase: SupabaseClient,
    private chatEventPublisher?: IChatEventPublisher,
  ) {}

  async markRead(
    conversationId: string,
    lastReadMessageId: string | null,
    clerkUserId: string,
  ): Promise<{ message: string }> {
    const { userId } = await resolveAndValidateParticipant(this.supabase, clerkUserId, conversationId);

    await this.repository.markRead(conversationId, userId, lastReadMessageId);

    await this.chatEventPublisher?.readReceipt(conversationId, {
      conversationId,
      userId,
      lastReadMessageId,
    });

    return { message: 'Read receipt updated' };
  }
}
