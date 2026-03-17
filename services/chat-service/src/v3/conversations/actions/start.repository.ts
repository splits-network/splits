/**
 * Start Action Repository
 *
 * Data access for createOrFind conversation with representation routing.
 * Queries: chat_conversations, chat_conversation_participants, candidates,
 *          recruiter_candidates, candidate_sourcers, recruiters, users,
 *          applications, jobs, companies, role_assignments
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class StartActionRepository {
  constructor(private supabase: SupabaseClient) {}

  async findConversation(
    participantAId: string,
    participantBId: string,
    context: { application_id?: string | null; job_id?: string | null; company_id?: string | null; candidate_id?: string | null },
  ): Promise<any | null> {
    let query = this.supabase
      .from('chat_conversations')
      .select('*')
      .eq('participant_a_id', participantAId)
      .eq('participant_b_id', participantBId);

    for (const [key, value] of Object.entries(context)) {
      query = value ? query.eq(key, value) : query.is(key, null);
    }

    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data;
  }

  async createConversation(
    participantAId: string,
    participantBId: string,
    context: { application_id?: string | null; job_id?: string | null; company_id?: string | null; candidate_id?: string | null },
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from('chat_conversations')
      .insert({
        participant_a_id: participantAId,
        participant_b_id: participantBId,
        application_id: context.application_id ?? null,
        job_id: context.job_id ?? null,
        company_id: context.company_id ?? null,
        candidate_id: context.candidate_id ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async ensureParticipants(
    conversationId: string,
    participants: Array<{ user_id: string; request_state: string }>,
  ): Promise<void> {
    const rows = participants.map((p) => ({ conversation_id: conversationId, ...p }));
    const { error } = await this.supabase
      .from('chat_conversation_participants')
      .upsert(rows, { onConflict: 'conversation_id,user_id' });
    if (error) throw error;
  }

  async insertSystemMessage(conversationId: string, senderId: string, body: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .insert({ conversation_id: conversationId, sender_id: senderId, body, kind: 'system' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateMessageMetadata(messageId: string, metadata: Record<string, any>): Promise<void> {
    const { error } = await this.supabase
      .from('chat_messages')
      .update({ metadata })
      .eq('id', messageId);
    if (error) throw error;
  }

  async updateConversationLastMessage(conversationId: string, message: any): Promise<void> {
    const { error } = await this.supabase
      .from('chat_conversations')
      .update({ last_message_at: message.created_at, last_message_id: message.id })
      .eq('id', conversationId);
    if (error) throw error;
  }

  /** Resolve representation routing for a candidate user. */
  async resolveRepresentation(
    candidateUserId: string,
    senderUserId: string,
  ): Promise<{
    routed: boolean;
    recruiterUserId: string | null;
    candidateId: string | null;
    candidateName: string | null;
    recruiterName: string | null;
  }> {
    const noRoute = { routed: false, recruiterUserId: null, candidateId: null, candidateName: null, recruiterName: null };

    const { data: candidate } = await this.supabase
      .from('candidates')
      .select('id, full_name')
      .eq('user_id', candidateUserId)
      .maybeSingle();
    if (!candidate) return noRoute;

    const { data: relationship } = await this.supabase
      .from('recruiter_candidates')
      .select('recruiter_id, relationship_end_date')
      .eq('candidate_id', candidate.id)
      .eq('status', 'active')
      .eq('consent_given', true)
      .maybeSingle();
    if (!relationship) return noRoute;

    if (relationship.relationship_end_date && new Date(relationship.relationship_end_date) < new Date()) {
      return noRoute;
    }

    const { data: sourcer } = await this.supabase
      .from('candidate_sourcers')
      .select('sourcer_recruiter_id, protection_expires_at')
      .eq('candidate_id', candidate.id)
      .maybeSingle();
    if (!sourcer?.protection_expires_at || new Date(sourcer.protection_expires_at) < new Date()) {
      return noRoute;
    }

    const { data: recruiter } = await this.supabase
      .from('recruiters')
      .select('id, user_id')
      .eq('id', relationship.recruiter_id)
      .eq('status', 'active')
      .maybeSingle();
    if (!recruiter?.user_id || recruiter.user_id === senderUserId) return noRoute;

    let recruiterName: string | null = null;
    const { data: recruiterUser } = await this.supabase
      .from('users')
      .select('name')
      .eq('id', recruiter.user_id)
      .maybeSingle();
    if (recruiterUser) recruiterName = recruiterUser.name;

    return {
      routed: true,
      recruiterUserId: recruiter.user_id,
      candidateId: candidate.id,
      candidateName: candidate.full_name,
      recruiterName,
    };
  }
}
