import { SupabaseClient } from '@supabase/supabase-js';
import {
    CallParticipant,
    CallParticipantRole,
    CallParticipantWithUser,
} from './types';

export class ParticipantRepository {
    constructor(private supabase: SupabaseClient) {}

    async addParticipant(
        callId: string,
        input: { user_id: string; role: CallParticipantRole },
    ): Promise<CallParticipant> {
        const { data, error } = await this.supabase
            .from('call_participants')
            .insert({ call_id: callId, user_id: input.user_id, role: input.role })
            .select()
            .single();

        if (error) throw error;
        return data as CallParticipant;
    }

    async removeParticipant(participantId: string): Promise<void> {
        const { error } = await this.supabase
            .from('call_participants')
            .delete()
            .eq('id', participantId);

        if (error) throw error;
    }

    async getCallParticipants(callId: string): Promise<CallParticipantWithUser[]> {
        const { data: participants, error } = await this.supabase
            .from('call_participants')
            .select('*')
            .eq('call_id', callId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        if (!participants || participants.length === 0) return [];

        const userIds = participants.map((p: CallParticipant) => p.user_id);
        const { data: users, error: userError } = await this.supabase
            .from('users')
            .select('id, first_name, last_name, profile_image_url, email')
            .in('id', userIds);

        if (userError) throw userError;

        const userMap = new Map<string, {
            first_name: string; last_name: string; avatar_url: string | null; email: string;
        }>();
        for (const u of users || []) {
            userMap.set(u.id, {
                first_name: u.first_name || '',
                last_name: u.last_name || '',
                avatar_url: u.profile_image_url || null,
                email: u.email || '',
            });
        }

        const defaultUser = { first_name: '', last_name: '', avatar_url: null, email: '' };

        return participants.map((p: CallParticipant) => ({
            ...p,
            user: userMap.get(p.user_id) || defaultUser,
        }));
    }

    async updateParticipantJoin(participantId: string, joinedAt: string): Promise<CallParticipant> {
        const { data, error } = await this.supabase
            .from('call_participants')
            .update({ joined_at: joinedAt })
            .eq('id', participantId)
            .select()
            .single();

        if (error) throw error;
        return data as CallParticipant;
    }

    async updateParticipantLeave(participantId: string, leftAt: string): Promise<CallParticipant> {
        const { data, error } = await this.supabase
            .from('call_participants')
            .update({ left_at: leftAt })
            .eq('id', participantId)
            .select()
            .single();

        if (error) throw error;
        return data as CallParticipant;
    }

    async updateParticipantConsent(
        participantId: string,
        consentGiven: boolean,
    ): Promise<CallParticipant> {
        const { data, error } = await this.supabase
            .from('call_participants')
            .update({
                consent_given: consentGiven,
                consent_at: consentGiven ? new Date().toISOString() : null,
            })
            .eq('id', participantId)
            .select()
            .single();

        if (error) throw error;
        return data as CallParticipant;
    }
}
