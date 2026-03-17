/**
 * Candidate Recent Applications View Service
 *
 * Authorization: candidate can view own applications, admins can view any.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { CandidateRecentApplicationsRepository } from './recent-applications.repository';

export class CandidateRecentApplicationsService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: CandidateRecentApplicationsRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getRecentApplications(candidateId: string, limit: number, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (context.candidateId !== candidateId && !context.isPlatformAdmin) {
      throw new ForbiddenError('You can only view your own recent applications');
    }
    return this.repository.getRecentApplications(candidateId, limit);
  }
}
