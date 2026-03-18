/**
 * Company Reputation List View Service
 * GET /api/v3/company-reputation/views/list
 *
 * Company reputation records with company details.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { NotFoundError } from '@splits-network/shared-fastify';
import { CompanyReputationListParams } from '../types';
import { CompanyReputationListViewRepository } from './list.repository';

export class CompanyReputationListViewService {
  constructor(
    private repository: CompanyReputationListViewRepository,
    private supabase: SupabaseClient
  ) {}

  async getAll(params: CompanyReputationListParams) {
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getByCompanyId(companyId: string) {
    const reputation = await this.repository.findByCompanyId(companyId);
    if (!reputation) throw new NotFoundError('CompanyReputation', companyId);
    return reputation;
  }
}
