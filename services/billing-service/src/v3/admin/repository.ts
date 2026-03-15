/**
 * Admin Billing V3 Repository - Read-only admin queries
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AdminListParams } from './types';

export class AdminBillingRepository {
  constructor(private supabase: SupabaseClient) {}

  async listPayouts(params: AdminListParams) {
    const { page = 1, limit = 25, status, search } = params;
    const offset = (page - 1) * limit;
    let query = this.supabase.from('placement_payout_transactions').select('*', { count: 'exact' })
      .order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (status) query = query.eq('status', status);
    if (search) query = query.ilike('id', `%${search}%`);
    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async listEscrowHolds(params: AdminListParams) {
    const { page = 1, limit = 25, status } = params;
    const offset = (page - 1) * limit;
    let query = this.supabase.from('escrow_holds').select('*', { count: 'exact' })
      .order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (status) query = query.eq('status', status);
    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async listBillingProfiles(params: AdminListParams) {
    const { page = 1, limit = 25 } = params;
    const offset = (page - 1) * limit;
    const { data, error, count } = await this.supabase.from('company_billing_profiles')
      .select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async releaseEscrowHold(id: string) {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase.from('escrow_holds')
      .update({ status: 'released', released_at: now, updated_at: now }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async getCounts() {
    const [payouts, escrow, profiles] = await Promise.all([
      this.supabase.from('placement_payout_transactions').select('id', { count: 'exact', head: true }),
      this.supabase.from('escrow_holds').select('id', { count: 'exact', head: true }).eq('status', 'held'),
      this.supabase.from('company_billing_profiles').select('id', { count: 'exact', head: true }),
    ]);
    return { total_payouts: payouts.count || 0, active_escrow_holds: escrow.count || 0, billing_profiles: profiles.count || 0 };
  }
}
