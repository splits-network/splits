/**
 * Calls V3 Repository — Pure CRUD (flat select('*') only)
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CallListParams } from './types.js';

const SORTABLE_FIELDS = ['created_at', 'scheduled_at', 'status'];

export class CallRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(params: CallListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('calls')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (params.call_type) query = query.eq('call_type', params.call_type);
    if (params.status) query = query.eq('status', params.status);
    if (params.date_from) query = query.gte('scheduled_at', params.date_from);
    if (params.date_to) query = query.lte('scheduled_at', params.date_to);
    if (params.needs_follow_up) query = query.eq('needs_follow_up', true);

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('calls')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(input: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('calls')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, input: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('calls')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('calls')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  async updateStatus(id: string, status: string, extraFields?: Record<string, any>): Promise<any> {
    const updates: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
      ...extraFields,
    };

    const { data, error } = await this.supabase
      .from('calls')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async resolveUserId(clerkUserId: string): Promise<string | null> {
    const isClerkId = clerkUserId.startsWith('user_');
    const column = isClerkId ? 'clerk_user_id' : 'id';

    const { data, error } = await this.supabase
      .from('users')
      .select('id')
      .eq(column, clerkUserId)
      .maybeSingle();

    if (error) throw error;
    return data?.id || null;
  }
}
