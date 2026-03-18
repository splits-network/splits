/**
 * V3 Connection Adapter
 *
 * Provides the same interface as V2 ConnectionRepository but uses a shared
 * SupabaseClient. This allows V2 service classes (CalendarService, EmailService,
 * LinkedInService) to work with V3 infrastructure via duck typing.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { OAuthConnection, OAuthConnectionStatus } from '@splits-network/shared-types';

export class ConnectionAdapter {
  constructor(private supabase: SupabaseClient) {}

  getSupabase(): SupabaseClient {
    return this.supabase;
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
}
