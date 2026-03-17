/**
 * Detail View Repository
 *
 * Single conversation with participant details (names, emails, roles).
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ListForUserRepository, ParticipantDetails } from './list-for-user.repository';

export class DetailViewRepository {
  private participantRepo: ListForUserRepository;

  constructor(private supabase: SupabaseClient) {
    this.participantRepo = new ListForUserRepository(supabase);
  }

  async findByIdWithParticipants(conversationId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('chat_conversations')
      .select('*')
      .eq('id', conversationId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const userIds = [data.participant_a_id, data.participant_b_id].filter(Boolean);
    const userMap = await this.participantRepo.fetchParticipantDetails(userIds);

    const fallback = (id: string): ParticipantDetails => ({
      id, name: null, email: 'Unknown', profile_image_url: null, user_role: null,
    });

    return {
      ...data,
      participant_a: userMap.get(data.participant_a_id) || fallback(data.participant_a_id),
      participant_b: userMap.get(data.participant_b_id) || fallback(data.participant_b_id),
    };
  }

  async getParticipantState(conversationId: string, userId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('chat_conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
