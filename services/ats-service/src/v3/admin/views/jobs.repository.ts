/**
 * Admin Jobs View Repository
 * Lists jobs with company join for admin dashboard
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AdminListParams } from '../types.js';

function paginate(params: AdminListParams) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 25));
  return { page, limit, offset: (page - 1) * limit };
}

export class AdminJobsRepository {
  constructor(private supabase: SupabaseClient) {}

  async findForAdmin(params: AdminListParams): Promise<{ data: any[]; total: number }> {
    const { page, limit, offset } = paginate(params);
    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order === 'asc';

    let query = this.supabase
      .from('jobs')
      .select('*, company:companies(id, name, logo_url)', { count: 'exact' });

    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }
    if (params.status) query = query.eq('status', params.status);
    if (params.commute_type) query = query.contains('commute_types', [params.commute_type]);
    if (params.job_level) query = query.eq('job_level', params.job_level);

    query = query.order(sortBy, { ascending }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findByIdForAdmin(id: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('jobs')
      .select('*, company:companies(id, name, logo_url, industry)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getCountsByStatus(): Promise<Record<string, number>> {
    const statuses = ['draft', 'pending', 'active', 'paused', 'filled', 'closed'];
    const results = await Promise.all(
      statuses.map(s =>
        this.supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', s)
      ),
    );

    const counts: Record<string, number> = {};
    statuses.forEach((s, i) => {
      counts[s] = results[i].count || 0;
    });
    return counts;
  }

  async updateStatus(id: string, status: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('jobs')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
