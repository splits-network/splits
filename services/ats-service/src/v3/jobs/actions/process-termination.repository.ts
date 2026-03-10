/**
 * Process Termination Action Repository
 * Status updates + recruiter field nulling
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface TerminationDecision {
  job_id: string;
  action: 'keep' | 'pause' | 'close';
}

export class ProcessTerminationRepository {
  constructor(private supabase: SupabaseClient) {}

  async processDecision(decision: TerminationDecision, recruiterId: string): Promise<void> {
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (decision.action === 'close') updates.status = 'closed';
    if (decision.action === 'pause') updates.status = 'paused';

    // Check which recruiter fields to null out
    const { data: job } = await this.supabase
      .from('jobs')
      .select('job_owner_recruiter_id, company_recruiter_id')
      .eq('id', decision.job_id)
      .single();

    if (job) {
      if (job.job_owner_recruiter_id === recruiterId) {
        updates.job_owner_recruiter_id = null;
      }
      if (job.company_recruiter_id === recruiterId) {
        updates.company_recruiter_id = null;
      }
    }

    const { error } = await this.supabase
      .from('jobs')
      .update(updates)
      .eq('id', decision.job_id);

    if (error) throw error;
  }
}
