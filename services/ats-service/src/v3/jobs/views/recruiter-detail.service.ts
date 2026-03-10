/**
 * Recruiter Detail View Service
 */

import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError, NotFoundError } from '@splits-network/shared-fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterDetailRepository } from './recruiter-detail.repository';

export class RecruiterDetailService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: RecruiterDetailRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getDetail(id: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

    if (!context.recruiterId && !context.isPlatformAdmin) {
      throw new ForbiddenError('Recruiter role required for this view');
    }

    const job = await this.repository.findById(id);
    if (!job) throw new NotFoundError('Job', id);

    const [requirements, skills] = await Promise.all([
      this.repository.findRequirements(id),
      this.repository.findSkills(id),
    ]);

    return { ...job, requirements, skills };
  }
}
