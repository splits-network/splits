/**
 * Candidate Detail View Service
 *
 * Enriches a candidate with representation status fields
 * computed from recruiter_candidates relationships.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { CandidateDetailRepository } from './detail.repository';
import { RecruiterSavedCandidateRepository } from '../../recruiter-saved-candidates/repository';

export class CandidateDetailService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: CandidateDetailRepository,
    private savedCandidateRepo: RecruiterSavedCandidateRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getDetail(id: string, clerkUserId: string) {
    const candidate = await this.repository.findById(id);
    if (!candidate) throw new NotFoundError('Candidate', id);

    const context = await this.accessResolver.resolve(clerkUserId);

    // Access control — same rules as core CRUD getById
    if (!context.isPlatformAdmin) {
      const isOwn = context.candidateId === id;
      const isRecruiter = !!context.recruiterId;
      const isCompanyUser = context.roles.some((r: string) =>
        ['company_admin', 'hiring_manager'].includes(r)
      );
      if (!isOwn && !isRecruiter && !isCompanyUser) {
        throw new ForbiddenError('You do not have access to this candidate');
      }
    }

    // Lookup saved status for recruiters
    let is_saved = false;
    let saved_record_id: string | null = null;
    if (context.recruiterId) {
      const savedRecord = await this.savedCandidateRepo.findByCandidateId(context.recruiterId, id);
      if (savedRecord) {
        is_saved = true;
        saved_record_id = savedRecord.id;
      }
    }

    // Enrich with relationship status + saved status
    return {
      ...this.enrichWithRelationshipStatus(candidate, context.recruiterId ?? undefined),
      is_saved,
      saved_record_id,
    };
  }

  private enrichWithRelationshipStatus(candidate: any, currentRecruiterId?: string) {
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

    // Flatten skills from join
    const skills = (candidate.skills || [])
      .map((cs: any) => cs.skill)
      .filter(Boolean);

    return {
      ...candidate,
      recruiter_relationships: undefined,
      skills,
      has_active_relationship: hasActiveRelationship,
      has_pending_invitation: hasPendingInvitation,
      has_other_active_recruiters: otherRecruiters.size > 0,
      other_active_recruiters_count: otherRecruiters.size,
      is_sourcer: !!currentRecruiterId && candidate.sourcer_recruiter_id === currentRecruiterId,
    };
  }
}
