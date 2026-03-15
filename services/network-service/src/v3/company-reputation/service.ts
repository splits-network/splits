/**
 * Company Reputation V3 Service — Business Logic
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError } from '@splits-network/shared-fastify';
import { CompanyReputationRepository } from './repository';
import { CompanyReputationListParams } from './types';

export class CompanyReputationService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: CompanyReputationRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: CompanyReputationListParams, clerkUserId: string) {
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getByCompanyId(companyId: string, clerkUserId: string) {
    const reputation = await this.repository.findByCompanyId(companyId);
    if (!reputation) throw new NotFoundError('CompanyReputation', companyId);
    return reputation;
  }
}
