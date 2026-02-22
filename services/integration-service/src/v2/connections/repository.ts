import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { OAuthConnection, OAuthConnectionStatus } from '@splits-network/shared-types';

export class ConnectionRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    getSupabase(): SupabaseClient {
        return this.supabase;
    }

    async listByUser(clerkUserId: string): Promise<OAuthConnection[]> {
        const { data, error } = await this.supabase
            .from('oauth_connections')
            .select('*')
            .eq('clerk_user_id', clerkUserId)
            .neq('status', 'revoked')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data ?? [];
    }

    async findById(id: string): Promise<OAuthConnection | null> {
        const { data, error } = await this.supabase
            .from('oauth_connections')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async findByUserAndProvider(clerkUserId: string, providerSlug: string): Promise<OAuthConnection | null> {
        const { data, error } = await this.supabase
            .from('oauth_connections')
            .select('*')
            .eq('clerk_user_id', clerkUserId)
            .eq('provider_slug', providerSlug)
            .neq('status', 'revoked')
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async create(connection: Omit<OAuthConnection, 'id' | 'created_at' | 'updated_at'>): Promise<OAuthConnection> {
        const { data, error } = await this.supabase
            .from('oauth_connections')
            .insert(connection)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id: string, updates: Partial<OAuthConnection>): Promise<OAuthConnection> {
        const { data, error } = await this.supabase
            .from('oauth_connections')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateStatus(id: string, status: OAuthConnectionStatus, error?: string): Promise<void> {
        const updates: Record<string, any> = { status };
        if (error) {
            updates.last_error = error;
            updates.error_at = new Date().toISOString();
        }

        const { error: dbError } = await this.supabase
            .from('oauth_connections')
            .update(updates)
            .eq('id', id);

        if (dbError) throw dbError;
    }

    async revoke(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('oauth_connections')
            .update({
                status: 'revoked' as OAuthConnectionStatus,
                access_token_enc: null,
                refresh_token_enc: null,
            })
            .eq('id', id);

        if (error) throw error;
    }

    /** Find connections with tokens expiring within a given window */
    async findExpiring(withinMinutes: number): Promise<OAuthConnection[]> {
        const threshold = new Date(Date.now() + withinMinutes * 60_000).toISOString();

        const { data, error } = await this.supabase
            .from('oauth_connections')
            .select('*')
            .eq('status', 'active')
            .not('token_expires_at', 'is', null)
            .lt('token_expires_at', threshold);

        if (error) throw error;
        return data ?? [];
    }
}
