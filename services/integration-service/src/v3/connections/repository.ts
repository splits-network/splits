/**
 * Connections V3 Repository — Core CRUD + OAuth support
 * Single table, no joins
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { OAuthConnection, OAuthConnectionStatus } from '@splits-network/shared-types';
import { ConnectionListParams } from './types';

const SORTABLE_FIELDS = ['created_at'];

export class ConnectionRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAllForUser(clerkUserId: string, params: ConnectionListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('oauth_connections')
      .select('*', { count: 'exact' })
      .eq('clerk_user_id', clerkUserId)
      .neq('status', 'revoked');

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<OAuthConnection | null> {
    const { data, error } = await this.supabase
      .from('oauth_connections')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findByUserAndProvider(clerkUserId: string, providerSlug: string): Promise<OAuthConnection | null> {
    const { data, error } = await this.supabase
      .from('oauth_connections')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .eq('provider_slug', providerSlug)
      .neq('status', 'revoked')
      .maybeSingle();

    if (error) throw error;
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

  async revoke(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('oauth_connections')
      .update({
        status: 'revoked' as OAuthConnectionStatus,
        access_token_enc: null,
        refresh_token_enc: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    return this.revoke(id);
  }
}
