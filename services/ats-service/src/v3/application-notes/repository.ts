/**
 * Application Notes V3 Repository — Core CRUD
 *
 * Single table queries only. NO role logic.
 * Role scoping, visibility filtering, and authorization happen in the service layer.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ApplicationNoteListParams } from './types';

const NOTE_SELECT = '*, created_by:users!created_by_user_id(id, name, email)';

export class ApplicationNoteRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: ApplicationNoteListParams,
    scopeFilters?: {
      application_ids?: string[];
      allowed_visibilities?: string[];
    }
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('application_notes')
      .select(NOTE_SELECT, { count: 'exact' });

    // Role-based scoping (set by service layer)
    if (scopeFilters?.application_ids) {
      if (scopeFilters.application_ids.length === 0) {
        return { data: [], total: 0 };
      }
      query = query.in('application_id', scopeFilters.application_ids);
    }
    if (scopeFilters?.allowed_visibilities && scopeFilters.allowed_visibilities.length > 0) {
      query = query.in('visibility', scopeFilters.allowed_visibilities);
    }

    // User-supplied filters
    if (params.application_id) query = query.eq('application_id', params.application_id);
    if (params.note_type) query = query.eq('note_type', params.note_type);
    if (params.visibility) query = query.eq('visibility', params.visibility);
    if (params.in_response_to_id) query = query.eq('in_response_to_id', params.in_response_to_id);

    // Chronological order for notes (oldest first)
    query = query.order('created_at', { ascending: true });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('application_notes')
      .select(NOTE_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('application_notes')
      .insert(record)
      .select(NOTE_SELECT)
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('application_notes')
      .update(updates)
      .eq('id', id)
      .select(NOTE_SELECT)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('application_notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
