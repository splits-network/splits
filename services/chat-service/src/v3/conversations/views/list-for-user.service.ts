/**
 * List-for-User View Service
 *
 * Enriches conversation list with participant details (names, emails, roles).
 * Prevents frontend from calling unauthorized GET /users/:id.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError } from '@splits-network/shared-fastify';
import { ListForUserRepository, ParticipantDetails } from './list-for-user.repository.js';

const FALLBACK_PARTICIPANT: Omit<ParticipantDetails, 'id'> = {
  name: null,
  email: 'Unknown',
  profile_image_url: null,
  user_role: null,
};

export class ListForUserService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: ListForUserRepository,
    supabase: SupabaseClient,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getListForUser(
    clerkUserId: string,
    filter: 'inbox' | 'requests' | 'archived',
    limit: number,
    cursor?: string,
  ) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.identityUserId) {
      throw new BadRequestError('User identity not found');
    }
    const userId = context.identityUserId;

    const { data: participantRows, total } = await this.repository.findForUser(
      userId, filter, limit, cursor,
    );

    if (participantRows.length === 0) {
      return { data: [], total: 0 };
    }

    // Collect unique user IDs from all conversations
    const userIds = new Set<string>();
    for (const row of participantRows) {
      if (row.chat_conversations) {
        userIds.add(row.chat_conversations.participant_a_id);
        userIds.add(row.chat_conversations.participant_b_id);
      }
    }

    const userMap = await this.repository.fetchParticipantDetails(Array.from(userIds));

    const enriched = participantRows.map((row: any) => {
      const conv = row.chat_conversations;
      const participantA = userMap.get(conv.participant_a_id) || { id: conv.participant_a_id, ...FALLBACK_PARTICIPANT };
      const participantB = userMap.get(conv.participant_b_id) || { id: conv.participant_b_id, ...FALLBACK_PARTICIPANT };

      return {
        conversation: { ...conv, participant_a: participantA, participant_b: participantB },
        participant: {
          conversation_id: row.conversation_id,
          user_id: row.user_id,
          muted_at: row.muted_at,
          archived_at: row.archived_at,
          request_state: row.request_state,
          last_read_at: row.last_read_at,
          last_read_message_id: row.last_read_message_id,
          unread_count: row.unread_count,
        },
      };
    });

    return { data: enriched, total };
  }
}
