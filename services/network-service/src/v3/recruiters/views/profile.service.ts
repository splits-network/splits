/**
 * Recruiter Profile View Service
 *
 * Flattens joined data for public profile display.
 */

import { NotFoundError } from '@splits-network/shared-fastify';
import { RecruiterProfileRepository } from './profile.repository';

export class RecruiterProfileService {
  constructor(private repository: RecruiterProfileRepository) {}

  async getBySlug(slug: string) {
    const recruiter = await this.repository.findBySlug(slug);
    if (!recruiter) throw new NotFoundError('Recruiter', slug);
    return this.enrich(recruiter);
  }

  async getById(id: string) {
    const recruiter = await this.repository.findById(id);
    if (!recruiter) throw new NotFoundError('Recruiter', id);
    return this.enrich(recruiter);
  }

  private async enrich(recruiter: any) {
    const flat = this.flatten(recruiter);

    const metrics = await this.repository.getResponseMetrics(flat.id);
    if (metrics) {
      flat.response_rate = metrics.response_rate;
      flat.avg_response_time_hours = metrics.avg_response_time_hours ?? flat.avg_response_time_hours;
    }

    return flat;
  }

  private flatten(recruiter: any): any {
    if (!recruiter) return recruiter;
    const { recruiter_reputation, firm_members, recruiter_activity_recent, ...rest } = recruiter;
    // Keep `users` nested object as-is — frontend references recruiter.users?.name etc.

    // Flatten activity
    if (recruiter_activity_recent && Array.isArray(recruiter_activity_recent)) {
      rest.recent_activity = recruiter_activity_recent;
    }

    // Flatten firm
    if (firm_members && Array.isArray(firm_members) && firm_members.length > 0) {
      const m = firm_members[0];
      rest.firm_name = m.firms?.name || null;
      rest.firm_slug = m.firms?.slug || null;
      rest.firm_role = m.role || null;
    }

    // Flatten reputation
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
