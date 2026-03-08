import { SupabaseClient } from '@supabase/supabase-js';
import {
    CallEntityType,
    CallEntityLink,
    CallAccessToken,
    CallNoteWithUser,
} from './types';

export class ArtifactRepository {
    constructor(private supabase: SupabaseClient) {}

    // ── Entity Links ──────────────────────────────────────────────────────

    async addEntityLink(
        callId: string,
        input: { entity_type: CallEntityType; entity_id: string },
    ): Promise<CallEntityLink> {
        const { data, error } = await this.supabase
            .from('call_entity_links')
            .insert({ call_id: callId, entity_type: input.entity_type, entity_id: input.entity_id })
            .select()
            .single();

        if (error) throw error;
        return data as CallEntityLink;
    }

    async removeEntityLink(linkId: string): Promise<void> {
        const { error } = await this.supabase
            .from('call_entity_links')
            .delete()
            .eq('id', linkId);

        if (error) throw error;
    }

    async getCallEntityLinks(callId: string): Promise<CallEntityLink[]> {
        const { data, error } = await this.supabase
            .from('call_entity_links')
            .select('*')
            .eq('call_id', callId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return (data || []) as CallEntityLink[];
    }

    // ── Access Tokens ─────────────────────────────────────────────────────

    async createAccessToken(input: {
        call_id: string;
        user_id: string;
        token: string;
        expires_at: string;
    }): Promise<CallAccessToken> {
        const { data, error } = await this.supabase
            .from('call_access_tokens')
            .insert(input)
            .select()
            .single();

        if (error) throw error;
        return data as CallAccessToken;
    }

    async getAccessTokenByToken(token: string): Promise<CallAccessToken | null> {
        const { data, error } = await this.supabase
            .from('call_access_tokens')
            .select('*')
            .eq('token', token)
            .maybeSingle();

        if (error) throw error;
        return data as CallAccessToken | null;
    }

    async markTokenUsed(tokenId: string): Promise<void> {
        const { error } = await this.supabase
            .from('call_access_tokens')
            .update({ used_at: new Date().toISOString() })
            .eq('id', tokenId);

        if (error) throw error;
    }

    // ── Notes ─────────────────────────────────────────────────────────────

    async getCallNotes(callId: string): Promise<CallNoteWithUser[]> {
        const { data: notes, error } = await this.supabase
            .from('call_notes')
            .select('*')
            .eq('call_id', callId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        if (!notes || notes.length === 0) return [];

        const userIds = [...new Set(notes.map((n: { user_id: string }) => n.user_id))];
        const { data: users, error: userError } = await this.supabase
            .from('users')
            .select('id, first_name, last_name')
            .in('id', userIds);

        if (userError) throw userError;

        const userMap = new Map<string, { first_name: string; last_name: string }>();
        for (const u of users || []) {
            userMap.set(u.id, { first_name: u.first_name || '', last_name: u.last_name || '' });
        }

        return notes.map((n: any) => ({
            ...n,
            user: userMap.get(n.user_id) || { first_name: '', last_name: '' },
        }));
    }
}
