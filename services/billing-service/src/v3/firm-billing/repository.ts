/**
 * Firm Billing V3 Repository — Pure data layer
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class FirmBillingRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByFirmId(firmId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('firm_billing_profiles')
      .select('*')
      .eq('firm_id', firmId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('firm_billing_profiles')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(firmId: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('firm_billing_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('firm_id', firmId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }
}
