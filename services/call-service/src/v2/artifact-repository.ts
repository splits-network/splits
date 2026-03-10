import { SupabaseClient } from '@supabase/supabase-js';
import {
    CallEntityType,
    CallEntityLink,
    CallAccessToken,
    CallRecording,
    CallNoteWithUser,
    CallTag,
    CallTagLink,
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

    // ── Tags ────────────────────────────────────────────────────────────

    async addCallTags(callId: string, tagSlugs: string[]): Promise<CallTagLink[]> {
        if (tagSlugs.length === 0) return [];

        const rows = tagSlugs.map((slug) => ({ call_id: callId, tag_slug: slug }));
        const { data, error } = await this.supabase
            .from('call_tag_links')
            .upsert(rows, { onConflict: 'call_id,tag_slug', ignoreDuplicates: true })
            .select();

        if (error) throw error;
        return (data || []) as CallTagLink[];
    }

    async removeCallTags(callId: string, tagSlugs: string[]): Promise<void> {
        if (tagSlugs.length === 0) return;

        const { error } = await this.supabase
            .from('call_tag_links')
            .delete()
            .eq('call_id', callId)
            .in('tag_slug', tagSlugs);

        if (error) throw error;
    }

    async getCallTags(callId: string): Promise<CallTagLink[]> {
        const { data, error } = await this.supabase
            .from('call_tag_links')
            .select('*')
            .eq('call_id', callId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return (data || []) as CallTagLink[];
    }

    async listTags(): Promise<CallTag[]> {
        const { data, error } = await this.supabase
            .from('call_tags')
            .select('*')
            .order('label', { ascending: true });

        if (error) throw error;
        return (data || []) as CallTag[];
    }

    // ── Recordings ────────────────────────────────────────────────────────

    async getRecording(recordingId: string): Promise<CallRecording | null> {
        const { data, error } = await this.supabase
            .from('call_recordings')
            .select('*')
            .eq('id', recordingId)
            .maybeSingle();

        if (error) throw error;
        return data as CallRecording | null;
    }

    async generateRecordingSignedUrl(blobUrl: string): Promise<{ url: string; expires_in: number }> {
        const storagePath = this.extractStoragePath(blobUrl);
        const expiresIn = 3600;

        const { data, error } = await this.supabase.storage
            .from('call-recordings')
            .createSignedUrl(storagePath, expiresIn);

        if (error || !data?.signedUrl) {
            throw Object.assign(
                new Error(`Failed to generate signed URL: ${error?.message || 'Unknown error'}`),
                { statusCode: 500 },
            );
        }

        return { url: data.signedUrl, expires_in: expiresIn };
    }

    private extractStoragePath(blobUrl: string): string {
        if (!blobUrl.startsWith('http')) return blobUrl;

        try {
            const parsed = new URL(blobUrl);
            const pathParts = parsed.pathname.split('/');
            const bucketIndex = pathParts.indexOf('call-recordings');
            if (bucketIndex !== -1) {
                return pathParts.slice(bucketIndex + 1).join('/');
            }
            return pathParts.slice(-3).join('/');
        } catch {
            return blobUrl;
        }
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
            .select('id, name')
            .in('id', userIds);

        if (userError) throw userError;

        const userMap = new Map<string, { name: string }>();
        for (const u of users || []) {
            userMap.set(u.id, { name: u.name || '' });
        }

        return notes.map((n: any) => ({
            ...n,
            user: userMap.get(n.user_id) || { name: '' },
        }));
    }
}
