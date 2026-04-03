/**
 * Payout Audit V3 Repository - Read-only audit trail queries
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AuditListParams } from './types.js';

export class PayoutAuditRepository {
  constructor(private supabase: SupabaseClient) {}

  async list(params: AuditListParams) {
    const { page = 1, limit = 25 } = params;
    const offset = (page - 1) * limit;
    let query = this.supabase.from('placement_payout_audit_log').select('*', { count: 'exact' })
      .order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (params.placement_id) query = query.eq('placement_id', params.placement_id);
    if (params.schedule_id) query = query.eq('schedule_id', params.schedule_id);
    if (params.event_type) query = query.eq('event_type', params.event_type);
    if (params.action) query = query.eq('action', params.action);
    if (params.changed_by) query = query.eq('changed_by', params.changed_by);
    if (params.date_from) query = query.gte('created_at', params.date_from);
    if (params.date_to) query = query.lte('created_at', params.date_to);
    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async getByPlacementId(placementId: string) {
    const { data, error } = await this.supabase.from('placement_payout_audit_log').select('*')
      .eq('placement_id', placementId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
}
