/**
 * Consent V3 Repository — Pure data layer
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SaveConsentInput } from './types.js';

export class ConsentRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByUserId(userId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('user_consent')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async upsert(userId: string, input: SaveConsentInput): Promise<any> {
    const { data, error } = await this.supabase
      .from('user_consent')
      .upsert(
        {
          user_id: userId,
          necessary: true,
          functional: input.preferences.functional,
          analytics: input.preferences.analytics,
          marketing: input.preferences.marketing,
          ip_address: input.ip_address || null,
          user_agent: input.user_agent || null,
          consent_source: input.consent_source || 'web',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_consent')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  }
}
