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

  async getApplicationsByCandidate(
    candidateId: string,
    includeInactive: boolean = false,
    page: number = 1,
    limit: number = 25,
  ): Promise<{ data: any[]; total: number }> {
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('applications')
      .select('*', { count: 'exact' })
      .eq('candidate_id', candidateId);

    if (!includeInactive) {
      query = query.not('status', 'in', '("withdrawn","rejected")');
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async checkDuplicateApplication(candidateId: string, jobId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('applications')
      .select('*')
      .eq('candidate_id', candidateId)
      .eq('job_id', jobId)
      .not('stage', 'in', '(withdrawn,rejected)')
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async createApplication(
    candidateId: string,
    jobId: string,
    coverLetter?: string,
    resumeData?: any,
    resumeSource?: string,
  ): Promise<any> {
    const payload: Record<string, unknown> = {
      candidate_id: candidateId,
      job_id: jobId,
      cover_letter: coverLetter,
      stage: 'gpt_review',
    };

    if (resumeData) {
      payload.resume_data = {
        ...resumeData,
        source: resumeSource || 'custom_gpt',
        created_at: new Date().toISOString(),
      };
    }

    const { data, error } = await this.supabase
      .from('applications')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async acceptProposalForReview(
    applicationId: string,
    coverLetter?: string,
    resumeData?: any,
    resumeSource?: string,
  ): Promise<any> {
    const payload: Record<string, unknown> = {
      stage: 'gpt_review',
      cover_letter: coverLetter,
    };

    if (resumeData) {
      payload.resume_data = {
        ...resumeData,
        source: resumeSource || 'custom_gpt',
        created_at: new Date().toISOString(),
      };
    }

    const { data, error } = await this.supabase
      .from('applications')
      .update(payload)
      .eq('id', applicationId)
      .eq('stage', 'recruiter_proposed')
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async savePreScreenAnswers(applicationId: string, answers: any[]): Promise<void> {
    const { error } = await this.supabase
      .from('applications')
      .update({ pre_screen_answers: answers })
      .eq('id', applicationId);

    if (error) throw error;
  }

  async getCandidateResume(candidateId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('entity_type', 'candidate')
      .eq('entity_id', candidateId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }
}
