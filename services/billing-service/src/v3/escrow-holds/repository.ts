/**
 * Escrow Holds V3 Repository — Pure data layer
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { EscrowHoldListParams } from './types';

export interface EscrowHoldScopeFilters {
  recruiter_id?: string;
  organization_ids?: string[];
}

export class EscrowHoldRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: EscrowHoldListParams,
    _scopeFilters?: EscrowHoldScopeFilters
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('escrow_holds')
      .select('*', { count: 'exact' });

    if (params.status) query = query.eq('status', params.status);
    if (params.placement_id) query = query.eq('placement_id', params.placement_id);
    if (params.date_from) query = query.gte('release_scheduled_date', params.date_from);
    if (params.date_to) query = query.lte('release_scheduled_date', params.date_to);

    const sortBy = params.sort_by || 'created_at';
    const ascending = (params.sort_order || 'desc').toLowerCase() === 'asc';
    query = query.order(sortBy, { ascending });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('escrow_holds')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findByPlacementId(placementId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('escrow_holds')
      .select('*')
      .eq('placement_id', placementId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('escrow_holds')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('escrow_holds')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async findDueReleases(beforeDate: Date): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('escrow_holds')
      .select('*')
      .eq('status', 'active')
      .lte('release_scheduled_date', beforeDate.toISOString())
      .order('release_scheduled_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getTotalActiveHolds(placementId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('escrow_holds')
      .select('hold_amount')
      .eq('placement_id', placementId)
      .eq('status', 'active');

    if (error) throw error;
    return (data || []).reduce((sum: number, row: any) => sum + (Number(row.hold_amount) || 0), 0);
  }
}
