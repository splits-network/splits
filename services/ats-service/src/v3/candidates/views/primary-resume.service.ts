/**
 * Candidate Primary Resume View Service
 *
 * Authorization: candidate (own), recruiter, company user, or admin.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { CandidatePrimaryResumeRepository } from './primary-resume.repository.js';

export class CandidatePrimaryResumeService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: CandidatePrimaryResumeRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getPrimaryResume(candidateId: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const canAccess = context.isPlatformAdmin || !!context.recruiterId ||
      context.candidateId === candidateId ||
      context.roles.some(r => ['company_admin', 'hiring_manager'].includes(r));

    if (!canAccess) {
      throw new ForbiddenError('You do not have permission to view this resume');
    }

    return this.repository.getPrimaryResume(candidateId);
  }
}
