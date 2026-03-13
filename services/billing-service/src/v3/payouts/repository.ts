/**
 * Payouts V3 Repository — Pure data layer for splits + transactions
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { TransactionListParams } from './types';

export interface PayoutScopeFilters {
  recruiter_id?: string;
}

export class PayoutRepository {
  constructor(private supabase: SupabaseClient) {}

  // --- Placement Splits ---

  async getSplitsByPlacementId(placementId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('placement_splits')
      .select('*')
      .eq('placement_id', placementId);

    if (error) throw error;
    return data || [];
  }

  async createSplitsBatch(records: Record<string, any>[]): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('placement_splits')
      .insert(records)
      .select();

    if (error) throw error;
    return data || [];
  }

  // --- Payout Transactions ---

  async listTransactions(
    params: TransactionListParams,
    scopeFilters?: PayoutScopeFilters
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('placement_payout_transactions')
      .select('*', { count: 'exact' });

    if (scopeFilters?.recruiter_id) {
      query = query.eq('recruiter_id', scopeFilters.recruiter_id);
    }
    if (params.placement_id) query = query.eq('placement_id', params.placement_id);
    if (params.status) query = query.eq('status', params.status);
    if (params.transaction_type) query = query.eq('transaction_type', params.transaction_type);

    const sortBy = params.sort_by || 'created_at';
    const ascending = (params.sort_order || 'desc').toLowerCase() === 'asc';
    query = query.order(sortBy, { ascending });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async getTransactionById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('placement_payout_transactions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getTransactionsByPlacementId(placementId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('placement_payout_transactions')
      .select('*')
      .eq('placement_id', placementId);

    if (error) throw error;
    return data || [];
  }

  async createTransactionsBatch(records: Record<string, any>[]): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('placement_payout_transactions')
      .insert(records)
      .select();

    if (error) throw error;
    return data || [];
  }

  async updateTransactionStatus(
    id: string,
    status: string,
    extra: Record<string, any> = {}
  ): Promise<any> {
    const updates: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
      ...extra,
    };

    if (status === 'processing') updates.processing_started_at = new Date().toISOString();
    if (status === 'paid') updates.completed_at = new Date().toISOString();
    if (status === 'failed') updates.failed_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('placement_payout_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // --- Recruiter Connect Status ---

  async getRecruiterConnectStatus(recruiterId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('recruiters')
      .select('id, stripe_connect_account_id, stripe_connect_onboarded')
      .eq('id', recruiterId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getFirmConnectAccount(firmId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('firm_stripe_accounts')
      .select('*')
      .eq('firm_id', firmId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // --- Placement Snapshot ---

  async getSnapshotByPlacementId(placementId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('placement_snapshots')
      .select('*')
      .eq('placement_id', placementId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
