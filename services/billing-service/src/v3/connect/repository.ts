/**
 * Connect V3 Repository — Pure data layer for recruiter Stripe Connect
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class ConnectRepository {
  constructor(private supabase: SupabaseClient) {}

  async getRecruiterById(recruiterId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('recruiters')
      .select('id, stripe_connect_account_id, stripe_connect_onboarded, stripe_connect_onboarded_at')
      .eq('id', recruiterId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async setConnectAccount(recruiterId: string, accountId: string): Promise<void> {
    const { error } = await this.supabase
      .from('recruiters')
      .update({
        stripe_connect_account_id: accountId,
        stripe_connect_onboarded: false,
        stripe_connect_onboarded_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', recruiterId);

    if (error) throw error;
  }

  async updateConnectStatus(
    recruiterId: string,
    onboarded: boolean,
    onboardedAt: string | null
  ): Promise<void> {
    const { error } = await this.supabase
      .from('recruiters')
      .update({
        stripe_connect_onboarded: onboarded,
        stripe_connect_onboarded_at: onboardedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', recruiterId);

    if (error) throw error;
  }
}
