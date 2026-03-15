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

    // Check if recruiter is the job owner and null it out
    const { data: job } = await this.supabase
      .from('jobs')
      .select('job_owner_recruiter_id')
      .eq('id', decision.job_id)
      .single();

    if (job && job.job_owner_recruiter_id === recruiterId) {
      updates.job_owner_recruiter_id = null;
    }

    const { error } = await this.supabase
      .from('jobs')
      .update(updates)
      .eq('id', decision.job_id);

    if (error) throw error;
  }
}
