/**
 * Marketplace Listing View Service
 *
 * Flattens joined data, enriches with plan tiers.
 * Public — no auth required.
 */

import { MarketplaceListingRepository } from './marketplace-listing.repository';
import { RecruiterListParams } from '../types';

export class MarketplaceListingService {
  constructor(private repository: MarketplaceListingRepository) {}

  async getListing(params: RecruiterListParams) {
    const { data, total } = await this.repository.findForListing(params);
    const flattened = data.map(r => this.flatten(r));

    const recruiterIds = flattened.map(r => r.id).filter(Boolean);
    const tierMap = await this.repository.batchGetPlanTiers(recruiterIds);
    for (const recruiter of flattened) {
      recruiter.plan_tier = tierMap.get(recruiter.id) || 'starter';
    }

    if (params.sort_by === 'plan_tier') {
      const tierPriority: Record<string, number> = { partner: 0, pro: 1, starter: 2 };
      const ascending = params.sort_order === 'asc';
      flattened.sort((a, b) => {
        const aP = tierPriority[a.plan_tier] ?? 3;
        const bP = tierPriority[b.plan_tier] ?? 3;
        return ascending ? aP - bP : bP - aP;
      });
    }

    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data: flattened, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  private flatten(recruiter: any): any {
    if (!recruiter) return recruiter;
    const { recruiter_reputation, firm_members, ...rest } = recruiter;
    // Keep `users` nested object as-is — frontend references recruiter.users?.name etc.

    // Flatten firm data
    if (firm_members && Array.isArray(firm_members) && firm_members.length > 0) {
      const m = firm_members[0];
      rest.firm_name = m.firms?.name || null;
      rest.firm_slug = m.firms?.slug || null;
      rest.firm_role = m.role || null;
    }

    // Flatten reputation data
    const flattenRep = (rep: any) => ({
      ...rest,
      reputation_score: rep.reputation_score,
      total_submissions: rep.total_submissions,
      total_hires: rep.total_hires,
      hire_rate: rep.hire_rate,
      completion_rate: rep.completion_rate,
      total_placements: rep.total_placements,
      completed_placements: rep.completed_placements,
      failed_placements: rep.failed_placements,
      total_collaborations: rep.total_collaborations,
      collaboration_rate: rep.collaboration_rate,
      avg_response_time_hours: rep.avg_response_time_hours,
    });

    if (recruiter_reputation && Array.isArray(recruiter_reputation) && recruiter_reputation.length > 0) {
      return flattenRep(recruiter_reputation[0]);
    }
    if (recruiter_reputation && !Array.isArray(recruiter_reputation)) {
      return flattenRep(recruiter_reputation);
    }
    return rest;
  }
}
