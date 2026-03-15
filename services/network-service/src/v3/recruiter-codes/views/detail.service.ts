/**
 * Recruiter-Code Detail View Service
 * GET /api/v3/recruiter-codes/:id/view/detail
 *
 * Returns enriched recruiter code with recruiter info and usage count.
 * Includes access control — non-admins can only view their own codes.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { RecruiterCodeDetailRepository } from './detail.repository';

export class RecruiterCodeDetailService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: RecruiterCodeDetailRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getDetail(id: string, clerkUserId: string) {
    const code = await this.repository.findById(id);
    if (!code) throw new NotFoundError('RecruiterCode', id);

    const ctx = await this.accessResolver.resolve(clerkUserId);
    if (!ctx.isPlatformAdmin && ctx.recruiterId !== code.recruiter_id) {
      throw new ForbiddenError('You do not have access to this recruiter code');
    }

    const usageCount = await this.repository.getUsageCount(id);
    return { ...code, usage_count: usageCount };
  }
}
