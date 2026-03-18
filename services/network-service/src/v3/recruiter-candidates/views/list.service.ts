/**
 * Recruiter-Candidates List View Service
 * GET /api/v3/recruiter-candidates/views/list
 *
 * Scoped list with candidate + recruiter joins and enrichment.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { RecruiterCandidateListParams } from '../types';
import { RecruiterCandidateListViewRepository } from './list.repository';

export class RecruiterCandidateListViewService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: RecruiterCandidateListViewRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: RecruiterCandidateListParams, clerkUserId?: string) {
    const scopeFilters = clerkUserId ? await this.buildScopeFilters(clerkUserId) : undefined;
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    if (scopeFilters === null) return { data: [], pagination: { total: 0, page, limit, total_pages: 0 } };
    const { data, total } = await this.repository.findAll(params, scopeFilters || undefined);
    const enriched = data.map((row: any) => this.enrichRelationship(row));
    return { data: enriched, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  private enrichRelationship(row: any): any {
    let daysUntilExpiry: number | undefined;
    if (row.relationship_end_date) {
      daysUntilExpiry = Math.ceil((new Date(row.relationship_end_date).getTime() - Date.now()) / 86400000);
    }
    return {
      ...row,
      recruiter_name: row.recruiter?.user?.name ?? null,
      recruiter_email: row.recruiter?.user?.email ?? null,
      days_until_expiry: daysUntilExpiry,
    };
  }

  private async buildScopeFilters(clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    if (ctx.isPlatformAdmin) return {};
    if (ctx.recruiterId) return { recruiter_id: ctx.recruiterId };
    if (ctx.candidateId) return { candidate_id: ctx.candidateId };
    return null;
  }
}
