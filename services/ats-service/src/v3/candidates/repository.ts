/**
 * Candidates V3 Repository — Pure Data Layer
 *
 * NO role logic. Scope filters are passed in from the service layer.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { CandidateListParams } from './types';

interface ScopeFilters {
  candidate_ids?: string[];
  user_id?: string;
}

export class CandidateRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: CandidateListParams,
    scopeFilters?: ScopeFilters
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('candidates')
      .select('*', { count: 'exact' });

    // Role-based scoping (set by service layer)
    if (scopeFilters?.candidate_ids && scopeFilters.candidate_ids.length > 0) {
      query = query.in('id', scopeFilters.candidate_ids);
    }
    if (scopeFilters?.user_id) {
      query = query.eq('user_id', scopeFilters.user_id);
    }

    // User-supplied filters
    if (params.status) query = query.eq('status', params.status);

    // Full-text search
    if (params.search) {
      const tsquery = params.search
        .replace(/[@+._\-/:]/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(t => t)
        .join(' & ');
      query = query.textSearch('search_vector', tsquery, {
        type: 'websearch',
        config: 'english',
      });
    }

    // Sorting
    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order === 'asc';
    query = query.order(sortBy, { ascending });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async findByClerkId(clerkUserId: string): Promise<any | null> {
    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();

    if (userError) throw userError;
    if (!user) return null;

    const { data, error } = await this.supabase
      .from('candidates')
      .select('*, user:users!user_id(id, email, name, clerk_user_id)')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('candidates')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('candidates')
      .update({ ...updates, updated_at: new Date().toISOString() })
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
      .from('candidates')
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  async getDashboardStats(candidateId: string) {
    const interviewStages = ['phone_screen', 'technical_interview', 'onsite_interview', 'final_interview'];
    const offerStages = ['offer_extended'];

    const [apps, interviews, offers, relationships] = await Promise.all([
      this.supabase.from('applications').select('id', { count: 'exact', head: true }).eq('candidate_id', candidateId),
      this.supabase.from('applications').select('id', { count: 'exact', head: true }).eq('candidate_id', candidateId).in('stage', interviewStages),
      this.supabase.from('applications').select('id', { count: 'exact', head: true }).eq('candidate_id', candidateId).in('stage', offerStages),
      this.supabase.from('recruiter_candidates').select('id', { count: 'exact', head: true }).eq('candidate_id', candidateId).eq('status', 'active'),
    ]);

    if (apps.error) throw apps.error;
    if (interviews.error) throw interviews.error;
    if (offers.error) throw offers.error;
    if (relationships.error) throw relationships.error;

    return {
      applications: apps.count || 0,
      interviews: interviews.count || 0,
      offers: offers.count || 0,
      active_relationships: relationships.count || 0,
    };
  }

  async getRecentApplications(candidateId: string, limit = 5) {
    const safeLimit = Math.max(1, Math.min(limit, 25));

    const { data, error } = await this.supabase
      .from('applications')
      .select(`id, job_id, stage, status, created_at, updated_at,
        job:jobs(id, title, location, company:companies(id, name))`)
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false })
      .range(0, safeLimit - 1);

    if (error) throw error;

    return (data || []).map((app: any) => ({
      id: app.id,
      job_id: app.job_id,
      job_title: app.job?.title || 'Unknown Position',
      company: app.job?.company?.name || 'Unknown Company',
      location: app.job?.location || null,
      status: app.status,
      stage: app.stage,
      applied_at: app.created_at,
      updated_at: app.updated_at,
    }));
  }

  async getPrimaryResume(candidateId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('entity_type', 'candidate')
      .eq('entity_id', candidateId)
      .eq('document_type', 'resume')
      .eq('metadata->>is_primary_for_candidate', 'true')
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const { data: signedUrlData } = await this.supabase.storage
      .from(data.bucket_name)
      .createSignedUrl(data.storage_path, 3600);

    return { ...data, download_url: signedUrlData?.signedUrl || null };
  }

  async getResumes(candidateId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('entity_type', 'candidate')
      .eq('entity_id', candidateId)
      .eq('document_type', 'resume')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(r => ({ ...r, is_primary: r.metadata?.is_primary_for_candidate === true }));
  }

  async createUserRole(userId: string, candidateId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_name: 'candidate',
        role_entity_id: candidateId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error && error.code !== '23505') throw error;
  }

  async getRecruiterCandidateIds(recruiterId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('recruiter_candidates')
      .select('candidate_id')
      .eq('recruiter_id', recruiterId)
      .eq('status', 'active');

    if (error) throw error;
    return (data || []).map(r => r.candidate_id);
  }

  async getCompanyCandidateIds(companyIds: string[]): Promise<string[]> {
    // Step 1: Get job IDs for the company
    const { data: jobs, error: jobsError } = await this.supabase
      .from('jobs')
      .select('id')
      .in('company_id', companyIds);

    if (jobsError) throw jobsError;
    if (!jobs || jobs.length === 0) return [];

    const jobIds = jobs.map((j: any) => j.id);

    // Step 2: Get distinct candidate IDs from applications on those jobs
    const { data: apps, error: appsError } = await this.supabase
      .from('applications')
      .select('candidate_id')
      .in('job_id', jobIds);

    if (appsError) throw appsError;
    return [...new Set((apps || []).map((a: any) => a.candidate_id))];
  }

  async getSavedCandidateIds(recruiterId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('recruiter_saved_candidates')
      .select('candidate_id')
      .eq('recruiter_id', recruiterId);

    if (error) throw error;
    return (data || []).map((r: any) => r.candidate_id);
  }
}
