/**
 * Placements V3 Repository — Core CRUD + filtered queries
 *
 * Pure data layer. NO role logic.
 * Role scoping and authorization happen in the service layer.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { PlacementListParams } from './types';

export interface PlacementScopeFilters {
  candidate_id?: string;
  recruiter_id?: string;
  organization_ids?: string[];
}

export class PlacementRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(
    params: PlacementListParams,
    scopeFilters?: PlacementScopeFilters
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('placements')
      .select('*', { count: 'exact' });

    // Role-based scoping (set by service layer)
    if (scopeFilters?.candidate_id) {
      query = query.eq('candidate_id', scopeFilters.candidate_id);
    }
    if (scopeFilters?.recruiter_id) {
      query = query.or(
        `candidate_recruiter_id.eq.${scopeFilters.recruiter_id},` +
        `company_recruiter_id.eq.${scopeFilters.recruiter_id},` +
        `job_owner_recruiter_id.eq.${scopeFilters.recruiter_id},` +
        `candidate_sourcer_recruiter_id.eq.${scopeFilters.recruiter_id},` +
        `company_sourcer_recruiter_id.eq.${scopeFilters.recruiter_id}`
      );
    }
    if (scopeFilters?.organization_ids && scopeFilters.organization_ids.length > 0) {
      // Find job IDs belonging to the user's organizations (can't use nested filter without join)
      const { data: orgJobs } = await this.supabase
        .from('jobs')
        .select('id, company:companies!inner(identity_organization_id)')
        .in('company.identity_organization_id', scopeFilters.organization_ids);
      const jobIds = (orgJobs || []).map((j: any) => j.id);
      if (jobIds.length === 0) return { data: [], total: 0 };
      query = query.in('job_id', jobIds);
    }

    // User-supplied filters
    query = this.applyFilters(query, params);

    // Sorting
    const sortBy = params.sort_by || 'created_at';
    const ascending = params.sort_order?.toLowerCase() === 'asc';
    query = query.order(sortBy, { ascending });
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  }

  private applyFilters(query: any, params: PlacementListParams): any {
    if (params.search) {
      const tsquery = params.search.replace(/[@+._\-/:]/g, ' ').trim().split(/\s+/).filter(Boolean).join(' & ');
      query = query.textSearch('search_vector', tsquery, { type: 'websearch', config: 'english' });
    }
    if (params.status) query = query.eq('status', params.status);
    if (params.job_id) query = query.eq('job_id', params.job_id);
    if (params.candidate_id) query = query.eq('candidate_id', params.candidate_id);

    query = this.applySalaryRange(query, params.salary_range);
    query = this.applyFeeRange(query, params.fee_range);
    query = this.applyFeeAmountRange(query, params.fee_amount_range);
    query = this.applyGuaranteeStatus(query, params.guarantee_status);
    query = this.applyIsReplacement(query, params.is_replacement);
    query = this.applyHasStarted(query, params.has_started);

    return query;
  }

  private applySalaryRange(query: any, range?: string): any {
    if (!range) return query;
    switch (range) {
      case 'under_50k': return query.lt('salary', 50000);
      case '50k_100k': return query.gte('salary', 50000).lt('salary', 100000);
      case '100k_150k': return query.gte('salary', 100000).lt('salary', 150000);
      case '150k_200k': return query.gte('salary', 150000).lt('salary', 200000);
      case 'over_200k': return query.gte('salary', 200000);
      default: return query;
    }
  }

  private applyFeeRange(query: any, range?: string): any {
    if (!range) return query;
    switch (range) {
      case 'under_15': return query.lt('fee_percentage', 15);
      case '15_20': return query.gte('fee_percentage', 15).lt('fee_percentage', 20);
      case '20_25': return query.gte('fee_percentage', 20).lt('fee_percentage', 25);
      case 'over_25': return query.gte('fee_percentage', 25);
      default: return query;
    }
  }

  private applyFeeAmountRange(query: any, range?: string): any {
    if (!range) return query;
    switch (range) {
      case 'under_10k': return query.lt('placement_fee', 10000);
      case '10k_25k': return query.gte('placement_fee', 10000).lt('placement_fee', 25000);
      case '25k_50k': return query.gte('placement_fee', 25000).lt('placement_fee', 50000);
      case 'over_50k': return query.gte('placement_fee', 50000);
      default: return query;
    }
  }

  private applyGuaranteeStatus(query: any, status?: string): any {
    if (!status) return query;
    const now = new Date().toISOString();
    const thirtyDays = new Date(Date.now() + 30 * 86400000).toISOString();
    switch (status) {
      case 'in_guarantee': return query.gte('guarantee_expires_at', now);
      case 'expiring_soon': return query.gte('guarantee_expires_at', now).lte('guarantee_expires_at', thirtyDays);
      case 'expired': return query.lt('guarantee_expires_at', now);
      case 'no_guarantee': return query.is('guarantee_expires_at', null);
      default: return query;
    }
  }

  private applyIsReplacement(query: any, value?: string): any {
    if (!value) return query;
    if (value === 'yes') return query.not('replacement_placement_id', 'is', null);
    if (value === 'no') return query.is('replacement_placement_id', null);
    return query;
  }

  private applyHasStarted(query: any, value?: string): any {
    if (!value) return query;
    const today = new Date().toISOString().split('T')[0];
    if (value === 'yes') return query.lte('start_date', today);
    if (value === 'no') return query.or(`start_date.gt.${today},start_date.is.null`);
    return query;
  }

  async findById(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('placements')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async create(record: Record<string, any>): Promise<any> {
    const { data, error } = await this.supabase
      .from('placements')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Record<string, any>): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('placements')
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
    // Soft delete — set status to cancelled
    const { error } = await this.supabase
      .from('placements')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }
}
