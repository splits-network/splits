/**
 * Detail View Service
 * Access control + enrichment for recruiter-candidate detail
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError, NotFoundError } from '@splits-network/shared-fastify';
import { DetailViewRepository } from './detail.repository';

export class DetailViewService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: DetailViewRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getDetail(id: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

    const rel = await this.repository.findById(id);
    if (!rel) throw new NotFoundError('RecruiterCandidate', id);

    if (!context.isPlatformAdmin) {
      if (context.recruiterId && context.recruiterId !== rel.recruiter_id) {
        throw new ForbiddenError('You do not have access to this relationship');
      }
      if (!context.recruiterId) {
        throw new ForbiddenError('You do not have access to this relationship');
      }
    }

    return this.enrichRelationship(rel);
  }

  private enrichRelationship(row: any): any {
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
      days_until_expiry: daysUntilExpiry,
    };
  }
}
