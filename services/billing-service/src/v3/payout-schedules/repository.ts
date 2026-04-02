/**
 * Payout Schedules V3 Repository — Pure data layer
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { PayoutScheduleListParams } from './types.js';

export interface PayoutScheduleScopeFilters {
  placement_ids?: string[];
}

export class PayoutScheduleRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: PayoutScheduleListParams,
    scopeFilters?: PayoutScheduleScopeFilters
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('payout_schedules')
      .select('*', { count: 'exact' });

    if (scopeFilters?.placement_ids) {
      query = query.in('placement_id', scopeFilters.placement_ids);
    }

    if (params.status) query = query.eq('status', params.status);
    if (params.placement_id) query = query.eq('placement_id', params.placement_id);
    if (params.trigger_event) query = query.eq('trigger_event', params.trigger_event);
    if (params.date_from) query = query.gte('scheduled_date', params.date_from);
    if (params.date_to) query = query.lte('scheduled_date', params.date_to);

    const sortBy = params.sort_by || 'scheduled_date';
    const ascending = (params.sort_order || 'asc').toLowerCase() === 'asc';
    query = query.order(sortBy, { ascending });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('payout_schedules')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('payout_schedules')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('payout_schedules')
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

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('payout_schedules')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: 'Deleted by administrator',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  }

  async findDueSchedules(beforeDate: Date): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('payout_schedules')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_date', beforeDate.toISOString())
      .order('scheduled_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async markTriggered(id: string): Promise<any> {
    return this.update(id, { status: 'triggered', triggered_at: new Date().toISOString() });
  }

  async markProcessing(id: string): Promise<any> {
    return this.update(id, { status: 'processing', triggered_at: new Date().toISOString() });
  }

  async markProcessed(id: string, payoutId: string | null): Promise<any> {
    return this.update(id, {
      status: 'processed',
      ...(payoutId && { payout_id: payoutId }),
      processed_at: new Date().toISOString(),
    });
  }

  async markFailed(id: string, reason: string): Promise<any> {
    const current = await this.findById(id);
    const retryCount = (current?.retry_count || 0) + 1;
    return this.update(id, {
      status: 'failed',
      failure_reason: reason,
      retry_count: retryCount,
      last_retry_at: new Date().toISOString(),
    });
  }
}
