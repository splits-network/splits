/**
 * Job Notes — Repository
 *
 * CRUD operations with visibility-based access control.
 * Company-side users see shared + company_only; platform admins see all.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { JobNote, JobNoteCreate, JobNoteUpdate, JobNoteFilters } from './types';

const NOTE_SELECT = '*, created_by:users!created_by_user_id(id, name, email)';

export class JobNoteRepository {
  private accessResolver: AccessContextResolver;

  constructor(private supabase: SupabaseClient) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async list(clerkUserId: string, filters: JobNoteFilters) {
    const { page = 1, limit = 50 } = filters;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('job_notes')
      .select(NOTE_SELECT, { count: 'exact' })
      .eq('job_id', filters.job_id);

    // Visibility filtering — company users see shared + company_only, which is all values
    // If we add candidate_only later, this is where we'd restrict
    if (filters.note_type) query = query.eq('note_type', filters.note_type);
    if (filters.visibility) query = query.eq('visibility', filters.visibility);

    query = query
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    return {
      data: (data || []) as JobNote[],
      pagination: {
        total: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async getById(id: string): Promise<JobNote | null> {
    const { data, error } = await this.supabase
      .from('job_notes')
      .select(NOTE_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as JobNote | null;
  }

  async create(data: JobNoteCreate & { created_by_user_id: string }): Promise<JobNote> {
    const { data: note, error } = await this.supabase
      .from('job_notes')
      .insert({
        job_id: data.job_id,
        created_by_user_id: data.created_by_user_id,
        created_by_type: data.created_by_type,
        note_type: data.note_type || 'general',
        visibility: data.visibility || 'company_only',
        message_text: data.message_text,
        in_response_to_id: data.in_response_to_id || null,
      })
      .select(NOTE_SELECT)
      .single();

    if (error) throw error;
    return note as JobNote;
  }

  async update(id: string, updates: JobNoteUpdate): Promise<JobNote> {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.message_text !== undefined) updateData.message_text = updates.message_text;
    if (updates.visibility !== undefined) updateData.visibility = updates.visibility;

    const { data, error } = await this.supabase
      .from('job_notes')
      .update(updateData)
      .eq('id', id)
      .select(NOTE_SELECT)
      .single();

    if (error) throw error;
    return data as JobNote;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('job_notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
