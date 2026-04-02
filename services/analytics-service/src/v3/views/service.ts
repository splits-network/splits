/**
 * Analytics Views V3 Service
 *
 * Resolves access context and delegates to repository for server-side aggregation.
 * No HTTP concepts. Typed errors only.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '../../v2/shared/access.js';
import { ViewRepository } from './repository.js';
import { ViewType, RecruiterScoreRow, RoleBreakdownRow, PendingReviewRow } from './types.js';

export class ViewService {
  constructor(
    private repository: ViewRepository,
    private supabase: SupabaseClient,
  ) {}

  async getView(
    clerkUserId: string,
    type: ViewType,
    limit: number = 20,
  ): Promise<RecruiterScoreRow[] | RoleBreakdownRow[] | PendingReviewRow[]> {
    const context = await resolveAccessContext(this.supabase, clerkUserId);
    const { companyId, recruiterId } = await this.resolveFilters(context);

    switch (type) {
      case 'recruiter-scorecard':
        return this.repository.getRecruiterScorecard(companyId, recruiterId, limit);
      case 'role-breakdown':
        return this.repository.getRoleBreakdown(companyId, recruiterId, limit);
      case 'pending-reviews':
        return this.repository.getPendingReviews(companyId, recruiterId, limit);
      default:
        throw new Error(`Unknown view type: ${type}`);
    }
  }

  /**
   * Resolve company_id and recruiter_id from access context.
   * Platform admins see all data (no filters).
   * Recruiters are scoped to their own recruiter_id.
   * Company users are scoped to their company_id.
   */
  private async resolveFilters(context: any): Promise<{
    companyId?: string;
    recruiterId?: string;
  }> {
    if (context.isPlatformAdmin) {
      return {};
    }

    let companyId: string | undefined;
    let recruiterId: string | undefined;

    if (context.recruiterId) {
      recruiterId = context.recruiterId;
    }

    if (context.companyIds?.length > 0) {
      companyId = context.companyIds[0];
    }

    // Fallback: resolve company from organizationIds
    if (!companyId && context.organizationIds?.length > 0) {
      const { data: companies } = await this.supabase
        .from('companies')
        .select('id')
        .in('identity_organization_id', context.organizationIds)
        .limit(1);

      if (companies && companies.length > 0) {
        companyId = companies[0].id;
      }
    }

    return { companyId, recruiterId };
  }
}