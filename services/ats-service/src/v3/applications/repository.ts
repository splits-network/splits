/**
 * Applications V3 Repository — Pure Data Layer
 *
 * NO role logic. ScopeFilters set by service layer.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ApplicationListParams } from './types';

export interface ApplicationScopeFilters {
  candidate_id?: string;
  recruiter_id?: string;
  company_ids?: string[];
  viewable_job_ids?: string[];
  is_admin?: boolean;
  visible_stages?: string[];
}

const LIST_SELECT = `*,
  candidate:candidates(id, full_name, email, phone, location, user_id,
    candidate_sourcer:candidate_sourcers(sourcer_recruiter_id,
      recruiter:recruiters(id, user_id, user:users!recruiters_user_id_fkey(name, email)))),
  job:jobs(*, company:companies(id, name, website, industry, company_size, headquarters_location,
    description, logo_url, identity_organization_id),
    firm:firms(id, name, logo_url),
    job_requirements:job_requirements(*))`;

export class ApplicationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: ApplicationListParams,
    scopeFilters?: ApplicationScopeFilters
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('applications')
      .select(LIST_SELECT, { count: 'exact' });

    // Apply scope filters from service layer
    query = this.applyScope(query, scopeFilters);

    // User-supplied filters
    if (params.search) {
      const tsquery = params.search.replace(/[@+._\-\/:]/g, ' ').trim()
        .split(/\s+/).filter((t: string) => t).join(' & ');
      query = query.textSearch('search_vector', tsquery, {
        type: 'websearch', config: 'english',
      });
    }
    if (params.stage) query = query.eq('stage', params.stage);
    if (params.job_id) query = query.eq('job_id', params.job_id);
    if (params.candidate_id) query = query.eq('candidate_id', params.candidate_id);
    if (params.recruiter_id) {
      query = query.or(
        `candidate_recruiter_id.eq.${params.recruiter_id},company_recruiter_id.eq.${params.recruiter_id}`
      );
    }

    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order?.toLowerCase() === 'asc';
    query = query.order(sortBy, { ascending });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Internal: fetch application with minimal job join for stage transition logic.
   * Used by service.update to check job.source_firm_id / job.company_id.
   */
  async findByIdWithJob(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('applications')
      .select('*, job:jobs(id, company_id, source_firm_id, job_owner_recruiter_id)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('applications')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('applications')
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
      .from('applications')
      .update({ stage: 'withdrawn', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  async batchGetAIReviews(applicationIds: string[]): Promise<any[]> {
    if (!applicationIds.length) return [];
    const { data, error } = await this.supabase
      .from('ai_reviews')
      .select('*')
      .in('application_id', applicationIds);
    if (error) throw error;
    return data || [];
  }

  async batchGetDocuments(applicationIds: string[]): Promise<any[]> {
    if (!applicationIds.length) return [];
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('entity_type', 'application')
      .in('entity_id', applicationIds)
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

  async linkDocumentToApplication(
    documentId: string, applicationId: string, isPrimary: boolean
  ): Promise<void> {
    const { data: originalDoc, error: fetchError } = await this.supabase
      .from('documents').select('*').eq('id', documentId).maybeSingle();
    if (fetchError || !originalDoc) throw new Error(`Document ${documentId} not found`);

    const { error } = await this.supabase.from('documents').insert({
      entity_type: 'application', entity_id: applicationId,
      document_type: originalDoc.document_type, filename: originalDoc.filename,
      storage_path: originalDoc.storage_path, bucket_name: originalDoc.bucket_name,
      content_type: originalDoc.content_type, file_size: originalDoc.file_size,
      uploaded_by_user_id: originalDoc.uploaded_by_user_id,
      processing_status: originalDoc.processing_status, scan_status: originalDoc.scan_status,
      structured_metadata: originalDoc.structured_metadata,
      processing_started_at: originalDoc.processing_started_at,
      processing_completed_at: originalDoc.processing_completed_at,
      processing_error: originalDoc.processing_error,
      metadata: { ...originalDoc.metadata, is_primary: isPrimary, original_document_id: documentId },
    });
    if (error) throw error;

    if (originalDoc.document_type === 'resume' && originalDoc.structured_metadata) {
      await this.supabase.from('applications').update({
        resume_data: {
          source: 'document_extraction', created_at: new Date().toISOString(),
          summary: originalDoc.structured_metadata.professional_summary,
          experience: originalDoc.structured_metadata.experience,
          education: originalDoc.structured_metadata.education,
          skills: originalDoc.structured_metadata.skills,
          certifications: originalDoc.structured_metadata.certifications,
        },
      }).eq('id', applicationId);
    }
  }

  async unlinkApplicationDocuments(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('documents')
      .update({ deleted_at: new Date().toISOString() })
      .eq('entity_type', 'application')
      .eq('entity_id', id)
      .is('deleted_at', null);
    if (error) throw error;
  }

  async createAuditLog(entry: {
    application_id: string; action: string;
    performed_by_user_id: string; performed_by_role: string;
    old_value?: any; new_value?: any; metadata?: any;
  }): Promise<void> {
    const { error } = await this.supabase
      .from('application_audit_log').insert(entry);
    if (error) throw error;
  }

  async getAuditLogs(applicationId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('application_audit_log')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async findAffectedByTermination(recruiterId: string, candidateId: string): Promise<any[]> {
    const terminalStages = ['rejected', 'withdrawn', 'hired'];
    const { data, error } = await this.supabase
      .from('applications')
      .select(`id, stage, created_at,
        job:jobs!job_id(id, title, company:companies!company_id(id, name))`)
      .eq('candidate_recruiter_id', recruiterId)
      .eq('candidate_id', candidateId)
      .not('stage', 'in', `(${terminalStages.join(',')})`)
      .is('expired_at', null)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((app: any) => ({
      id: app.id, stage: app.stage, created_at: app.created_at,
      job_title: app.job?.title || 'Unknown',
      company_name: app.job?.company?.name || 'Unknown',
    }));
  }

  async processTerminationDecisions(
    decisions: { application_id: string; action: 'keep' | 'withdraw' }[]
  ): Promise<void> {
    for (const decision of decisions) {
      const updates = decision.action === 'withdraw'
        ? { stage: 'withdrawn', updated_at: new Date().toISOString() }
        : { candidate_recruiter_id: null, updated_at: new Date().toISOString() };

      const { error } = await this.supabase
        .from('applications')
        .update(updates)
        .eq('id', decision.application_id);
      if (error) throw error;
    }
  }

  private applyScope(query: any, scope?: ApplicationScopeFilters): any {
    if (!scope || scope.is_admin) return query;

    if (scope.candidate_id) {
      return query.eq('candidate_id', scope.candidate_id);
    }

    if (scope.recruiter_id) {
      const parts = [
        `candidate_recruiter_id.eq.${scope.recruiter_id}`,
        `company_recruiter_id.eq.${scope.recruiter_id}`,
      ];
      if (scope.viewable_job_ids && scope.viewable_job_ids.length > 0) {
        parts.push(`job_id.in.(${scope.viewable_job_ids.join(',')})`);
      }
      return query.or(parts.join(','));
    }

    if (scope.company_ids && scope.company_ids.length > 0) {
      if (scope.viewable_job_ids && scope.viewable_job_ids.length > 0) {
        query = query.in('job_id', scope.viewable_job_ids);
      }
      if (scope.visible_stages) {
        query = query.in('stage', scope.visible_stages);
      }
      return query;
    }

    // Fallback: return nothing
    return query.eq('id', '00000000-0000-0000-0000-000000000000');
  }
}
