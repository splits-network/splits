/**
 * Call Recordings V3 Repository — Pure Data Layer
 *
 * Flat select('*') against call_recordings table only.
 * NO joins, NO HTTP errors, NO business logic.
 * Returns null on not-found — service layer decides what to do.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CallRecordingListParams, CreateCallRecordingInput, UpdateCallRecordingInput } from './types';

const SORTABLE_FIELDS = ['created_at', 'started_at', 'recording_status'];

export class CallRecordingRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: CallRecordingListParams
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('call_recordings')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    if (params.call_id) query = query.eq('call_id', params.call_id);
    if (params.recording_status) query = query.eq('recording_status', params.recording_status);

    const sortBy = SORTABLE_FIELDS.includes(params.sort_by || '') ? params.sort_by! : 'created_at';
    const ascending = params.sort_order === 'asc';
    query = query.order(sortBy, { ascending });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('call_recordings')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(input: CreateCallRecordingInput): Promise<any> {
    const { data, error } = await this.supabase
      .from('call_recordings')
      .insert({
        ...input,
        recording_status: input.recording_status || 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: UpdateCallRecordingInput): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('call_recordings')
      .update(updates)
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
      .from('call_recordings')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }
}
