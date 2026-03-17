/**
 * OAuth Sessions V3 Repository
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { OAuthSessionListParams } from './types';

export class OAuthSessionRepository {
  constructor(private supabase: SupabaseClient) {}

  async list(clerkUserId: string, params: OAuthSessionListParams) {
    const { page = 1, limit = 25 } = params;
    const offset = (page - 1) * limit;

    const { data, error, count } = await this.supabase
      .from('gpt_oauth_sessions')
      .select('id, clerk_user_id, scopes, granted_scopes, created_at, last_active, refresh_token_expiry', { count: 'exact' })
      .eq('clerk_user_id', clerkUserId)
      .order('last_active', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async revoke(sessionId: string, clerkUserId: string) {
    const { error } = await this.supabase
      .from('gpt_oauth_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('clerk_user_id', clerkUserId);

    if (error) throw error;
  }
}
