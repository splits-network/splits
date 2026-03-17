/**
 * GPT Actions V3 Repository
 * Read-only queries for GPT-facing endpoints
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class GptActionsRepository {
  constructor(private supabase: SupabaseClient) {}

  async searchJobs(keywords?: string, location?: string, commuteType?: string, jobLevel?: string, page: number = 1, limit: number = 10): Promise<{ data: any[]; total: number }> {
    const offset = (page - 1) * limit;

    let query = this.supabase.from('jobs').select('*', { count: 'exact' })
      .eq('status', 'published').is('deleted_at', null);

    if (keywords) query = query.ilike('title', `%${keywords}%`);
    if (location) query = query.ilike('location', `%${location}%`);
    if (commuteType) query = query.contains('commute_types', [commuteType]);
    if (jobLevel) query = query.eq('job_level', jobLevel);

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async getJobById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase.from('jobs').select('*')
      .eq('id', id).eq('status', 'published').is('deleted_at', null).maybeSingle();
    if (error) throw error;
    return data;
  }

  async getApplicationsByCandidate(candidateId: string, includeInactive: boolean = false): Promise<any[]> {
    let query = this.supabase.from('applications').select('*').eq('candidate_id', candidateId);
    if (!includeInactive) query = query.not('status', 'in', '("withdrawn","rejected")');
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
}
