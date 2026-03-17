/**
 * Firm Connect V3 Repository — Pure data layer
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class FirmConnectRepository {
  constructor(private supabase: SupabaseClient) {}

  async getByFirmId(firmId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('firm_stripe_accounts')
      .select('*')
      .eq('firm_id', firmId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(firmId: string, accountId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('firm_stripe_accounts')
      .insert({
        firm_id: firmId,
        stripe_connect_account_id: accountId,
        stripe_connect_onboarded: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateOnboardingStatus(firmId: string, onboarded: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('firm_stripe_accounts')
      .update({
        stripe_connect_onboarded: onboarded,
        ...(onboarded && { onboarded_at: new Date().toISOString() }),
        updated_at: new Date().toISOString(),
      })
      .eq('firm_id', firmId);

    if (error) throw error;
  }
}
