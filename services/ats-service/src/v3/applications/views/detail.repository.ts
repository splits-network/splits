/**
 * Application Detail View Repository
 *
 * Joined query returning the full application with candidate, job, company,
 * sourcer, recruiter, and optional includes (audit log, recruiter profile).
 */

import { SupabaseClient } from '@supabase/supabase-js';

const DETAIL_SELECT = `*,
  candidate:candidates(*,
    candidate_sourcer:candidate_sourcers(sourcer_recruiter_id,
      recruiter:recruiters(id, user_id, user:users!recruiters_user_id_fkey(name, email))),
    recruiter_relationships:recruiter_candidates(
      id, recruiter_id, status, consent_given, invitation_expires_at, declined_at),
    candidate_skills:candidate_skills(skill:skills(id, name))),
  job:jobs(*, company:companies(id, name, website, industry, company_size, headquarters_location,
    description, logo_url, identity_organization_id),
    job_requirements:job_requirements(*))`;

export class ApplicationDetailRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string, include?: string): Promise<any | null> {
    let selectClause = DETAIL_SELECT;

    if (include?.includes('recruiter')) {
      selectClause += `,recruiter:recruiters!candidate_recruiter_id(id, bio, phone, tagline, specialties, status, user_id, user:users!recruiters_user_id_fkey(name, email))`;
    }
    if (include?.includes('audit') || include?.includes('timeline')) {
      selectClause += `,audit_log:application_audit_log!application_audit_log_application_id_fkey(id, action, performed_by_user_id, performed_by_role, company_id, old_value, new_value, metadata, ip_address, user_agent, created_at)`;
    }

    const { data, error } = await this.supabase
      .from('applications')
      .select(selectClause)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getDocumentsForApplication(id: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('entity_type', 'application')
      .eq('entity_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(doc => ({
      ...doc,
      file_name: doc.filename,
      file_url: doc.storage_path,
      uploaded_at: doc.created_at,
      is_primary: doc.metadata?.is_primary || false,
    }));
  }

  async getAIReviewForApplication(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('ai_reviews')
      .select('*')
      .eq('application_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ?? null;
  }

  async getApplicationCountForJob(jobId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', jobId);
    if (error) return 0;
    return count ?? 0;
  }

  async getCompanySourcer(companyId: string): Promise<any | null> {
    if (!companyId) return null;
    const { data, error } = await this.supabase
      .from('recruiter_companies')
      .select('recruiter_id, recruiter:recruiters(id, user_id, user:users!recruiters_user_id_fkey(name, email))')
      .eq('company_id', companyId)
      .eq('relationship_type', 'sourcer')
      .eq('status', 'active')
      .maybeSingle();
    if (error) return null;
    return data ?? null;
  }
}
