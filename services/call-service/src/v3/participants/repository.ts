/**
 * Call Participants V3 Repository — Core CRUD
 * Single table, no joins
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ParticipantListParams } from './types.js';

const SORTABLE_FIELDS = ['created_at'];

export class ParticipantRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAllForCall(callId: string, params: ParticipantListParams): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('call_participants')
      .select('*', { count: 'exact' })
      .eq('call_id', callId);

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    query = query.order(sortBy, { ascending: params.sort_order === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('call_participants')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(callId: string, input: { user_id: string; role: string }): Promise<any> {
    const { data, error } = await this.supabase
      .from('call_participants')
      .insert({ call_id: callId, user_id: input.user_id, role: input.role })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('call_participants')
      .delete()
      .eq('id', id);

    if (error) throw error;
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
