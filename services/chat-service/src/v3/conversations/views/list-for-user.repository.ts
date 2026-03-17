/**
 * List-for-User View Repository
 *
 * Joins chat_conversation_participants -> chat_conversations -> users
 * to return enriched conversation list items with participant details.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface ParticipantDetails {
  id: string;
  name: string | null;
  email: string;
  profile_image_url: string | null;
  user_role: string | null;
}

export interface ListForUserItem {
  conversation: any;
  participant: any;
}

function deriveUserRole(user: any): string | null {
  const recruiters = Array.isArray(user.recruiters) ? user.recruiters : user.recruiters ? [user.recruiters] : [];
  if (recruiters.some((r: any) => r.status === 'active')) return 'recruiter';

  const candidates = Array.isArray(user.candidates) ? user.candidates : user.candidates ? [user.candidates] : [];
  if (candidates.length > 0) return 'candidate';

  const memberships = Array.isArray(user.memberships) ? user.memberships : user.memberships ? [user.memberships] : [];
  if (memberships.some((m: any) => ['company_admin', 'hiring_manager'].includes(m.role_name))) return 'company';

  return null;
}

export class ListForUserRepository {
  constructor(private supabase: SupabaseClient) {}

  async findForUser(
    userId: string,
    filter: 'inbox' | 'requests' | 'archived',
    limit: number,
    cursor?: string,
  ): Promise<{ data: any[]; total: number }> {
    let query = this.supabase
      .from('chat_conversation_participants')
      .select(`
        conversation_id, user_id, muted_at, archived_at, request_state,
        last_read_at, last_read_message_id, unread_count,
        chat_conversations (
          id, participant_a_id, participant_b_id,
          application_id, job_id, company_id, candidate_id,
          last_message_at, last_message_id, created_at, updated_at
        )
      `, { count: 'exact' })
      .eq('user_id', userId);

    if (filter === 'archived') {
      query = query.not('archived_at', 'is', null);
    } else {
      query = query.is('archived_at', null);
    }

    if (filter === 'requests') {
      query = query.eq('request_state', 'pending');
    } else if (filter === 'inbox') {
      query = query.neq('request_state', 'pending');
    }

    if (cursor) {
      query = query.lt('chat_conversations.last_message_at', cursor as any);
    }

    const { data, error, count } = await query
      .order('last_message_at', { foreignTable: 'chat_conversations', ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async fetchParticipantDetails(userIds: string[]): Promise<Map<string, ParticipantDetails>> {
    if (userIds.length === 0) return new Map();

    const { data: users, error } = await this.supabase
      .from('users')
      .select(`
        id, name, email, profile_image_url,
        recruiters!recruiters_user_id_fkey ( id, status ),
        candidates!candidates_user_id_fkey ( id ),
        memberships!memberships_user_id_fkey1 ( role_name )
      `)
      .in('id', userIds);

    if (error) throw error;

    const map = new Map<string, ParticipantDetails>();
    (users || []).forEach((user: any) => {
      map.set(user.id, {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_image_url: user.profile_image_url,
        user_role: deriveUserRole(user),
      });
    });
    return map;
  }
}
