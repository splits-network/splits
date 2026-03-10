/**
 * Termination Impact View Repository
 * Jobs affected by recruiter-company relationship termination
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class TerminationImpactRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAffected(recruiterId: string, companyId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('jobs')
      .select('id, title, status, created_at')
      .eq('company_id', companyId)
      .or(`job_owner_recruiter_id.eq.${recruiterId},company_recruiter_id.eq.${recruiterId}`)
      .in('status', ['active', 'early', 'priority', 'paused'])
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async batchFetchActiveApplicationCounts(jobIds: string[]): Promise<Record<string, number>> {
    if (jobIds.length === 0) return {};

    const { data } = await this.supabase
      .from('applications')
      .select('job_id')
      .in('job_id', jobIds)
      .not('stage', 'in', '(rejected,withdrawn,hired)')
      .is('expired_at', null);

    const counts: Record<string, number> = {};
    for (const a of data || []) {
      counts[a.job_id] = (counts[a.job_id] || 0) + 1;
    }
    return counts;
  }
}
