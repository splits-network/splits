/**
 * Candidate Enriched List View Service
 *
 * Applies scoping (same as core CRUD) then enriches each candidate
 * with relationship status fields computed from recruiter_candidates.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { CandidateEnrichedRepository } from './enriched.repository.js';
import { CandidateRepository } from '../repository.js';
import { RecruiterSavedCandidateRepository } from '../../recruiter-saved-candidates/repository.js';
import { CandidateListParams } from '../types.js';

export class CandidateEnrichedService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: CandidateEnrichedRepository,
    private crudRepository: CandidateRepository,
    private savedCandidateRepo: RecruiterSavedCandidateRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: CandidateListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const scopeFilters: { candidate_ids?: string[]; user_id?: string; exclude_hidden_marketplace?: boolean } = {};

    if (context.isPlatformAdmin) {
      // Admins see all — including hidden
    } else if (context.candidateId && !context.recruiterId) {
      scopeFilters.user_id = context.identityUserId || undefined;
    } else if (context.recruiterId) {
      const scope = params.scope || 'all';
      if (scope === 'mine') {
        const ids = await this.crudRepository.getRecruiterCandidateIds(context.recruiterId);
        if (ids.length === 0) return this.emptyPage(params);
        scopeFilters.candidate_ids = ids;
      } else if (scope === 'saved') {
        const ids = await this.crudRepository.getSavedCandidateIds(context.recruiterId);
        if (ids.length === 0) return this.emptyPage(params);
        scopeFilters.candidate_ids = ids;
      } else {
        // Browsing all candidates — exclude hidden from marketplace
        scopeFilters.exclude_hidden_marketplace = true;
      }
    } else if (context.organizationIds.length > 0) {
      const scope = params.scope || 'all';
      if (scope === 'mine') {
        if (context.companyIds.length === 0) return this.emptyPage(params);
        const ids = await this.crudRepository.getCompanyCandidateIds(context.companyIds);
        if (ids.length === 0) return this.emptyPage(params);
        scopeFilters.candidate_ids = ids;
      } else {
        // Browsing all candidates — exclude hidden from marketplace
        scopeFilters.exclude_hidden_marketplace = true;
      }
    } else {
      return this.emptyPage(params);
    }

    const { data, total } = await this.repository.findAll(params, scopeFilters);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);

    // Batch-lookup saved status for recruiters
    const candidateIds = data.map(c => c.id);
    const savedMap = context.recruiterId
      ? await this.savedCandidateRepo.findSavedMapForCandidates(context.recruiterId, candidateIds)
      : new Map<string, string>();

    const enriched = data.map(c => ({
      ...this.enrichCandidate(c, context.recruiterId ?? undefined),
      is_saved: savedMap.has(c.id),
      saved_record_id: savedMap.get(c.id) || null,
    }));

    return {
      data: enriched,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  private enrichCandidate(candidate: any, currentRecruiterId?: string) {
    const relationships = candidate.recruiter_relationships || [];

    const hasActiveRelationship = !!currentRecruiterId &&
      relationships.some((rel: any) =>
        rel.recruiter_id === currentRecruiterId &&
        rel.status === 'active' &&
        rel.consent_given
      );

    const hasPendingInvitation = !!currentRecruiterId && !hasActiveRelationship &&
      relationships.some((rel: any) =>
        rel.recruiter_id === currentRecruiterId &&
        !rel.consent_given &&
        !rel.declined_at &&
        rel.status !== 'terminated' &&
        new Date(rel.invitation_expires_at) > new Date()
      );

    const otherRecruiters = new Set(
      relationships
        .filter((rel: any) =>
          rel.status === 'active' &&
          rel.consent_given &&
          (!currentRecruiterId || rel.recruiter_id !== currentRecruiterId)
        )
        .map((rel: any) => rel.recruiter_id)
    );

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return {
      ...candidate,
      recruiter_relationships: undefined,
      has_active_relationship: hasActiveRelationship,
      has_pending_invitation: hasPendingInvitation,
      has_other_active_recruiters: otherRecruiters.size > 0,
      other_active_recruiters_count: otherRecruiters.size,
      is_sourcer: !!currentRecruiterId && candidate.sourcer_recruiter_id === currentRecruiterId,
      is_new: new Date(candidate.created_at) > sevenDaysAgo,
    };
  }

  private emptyPage(params: CandidateListParams) {
    return {
      data: [],
      pagination: { total: 0, page: params.page || 1, limit: params.limit || 25, total_pages: 0 },
    };
  }
}
