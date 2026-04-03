/**
 * List-for-Candidate View Service
 *
 * Resolves candidate identity, fetches relationships, and enriches
 * with recruiter_name, recruiter_email, recruiter_user_id, days_until_expiry.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { ListForCandidateViewRepository } from './list-for-candidate.repository.js';

export class ListForCandidateViewService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: ListForCandidateViewRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async listForCandidate(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

    if (!context.candidateId && !context.isPlatformAdmin) {
      throw new ForbiddenError('Only candidates can access this view');
    }

    const candidateId = context.candidateId;
    if (!candidateId) {
      return { data: [] };
    }

    const rows = await this.repository.findForCandidate(candidateId);
    return { data: rows.map((row) => this.enrich(row)) };
  }

  private enrich(row: any): any {
    let daysUntilExpiry: number | undefined;
    if (row.relationship_end_date) {
      daysUntilExpiry = Math.ceil(
        (new Date(row.relationship_end_date).getTime() - Date.now()) / 86400000
      );
    }
    return {
      ...row,
      recruiter_name: row.recruiter?.user?.name ?? null,
      recruiter_email: row.recruiter?.user?.email ?? null,
      recruiter_user_id: row.recruiter?.user_id ?? null,
      days_until_expiry: daysUntilExpiry,
    };
  }
}
