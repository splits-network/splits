/**
 * Placement Snapshot V3 Repository — Pure data layer
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { PlacementSnapshotListParams } from './types';

export class PlacementSnapshotRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: PlacementSnapshotListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('placement_snapshots')
      .select('*', { count: 'exact' });

    if (params.placement_id) {
      query = query.eq('placement_id', params.placement_id);
    }

    const sortBy = params.sort_by || 'created_at';
    const ascending = (params.sort_order || 'desc').toLowerCase() === 'asc';
    query = query.order(sortBy, { ascending });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async getByPlacementId(placementId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('placement_snapshots')
      .select('*')
      .eq('placement_id', placementId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('placement_snapshots')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
