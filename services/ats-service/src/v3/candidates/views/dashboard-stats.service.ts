/**
 * Candidate Dashboard Stats View Service
 *
 * Authorization: candidate can view own stats, admins can view any.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { CandidateDashboardStatsRepository } from './dashboard-stats.repository.js';

export class CandidateDashboardStatsService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: CandidateDashboardStatsRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getDashboardStats(candidateId: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (context.candidateId !== candidateId && !context.isPlatformAdmin) {
      throw new ForbiddenError('You can only view your own dashboard stats');
    }
    return this.repository.getDashboardStats(candidateId);
  }
}
