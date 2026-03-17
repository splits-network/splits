/**
 * Recruiter-Companies List View Service
 * GET /api/v3/recruiter-companies/views/list
 *
 * Resolves access context to scope results, then returns enriched list.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { RecruiterCompanyListRepository } from './list.repository';
import { RecruiterCompanyListParams } from '../types';

export class RecruiterCompanyListService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: RecruiterCompanyListRepository,
    private supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getList(params: RecruiterCompanyListParams, clerkUserId: string) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);

    const scopeFilters = await this.buildScopeFilters(clerkUserId);
    if (scopeFilters === null) {
      return { data: [], pagination: { total: 0, page, limit, total_pages: 0 } };
    }

    const { data, total } = await this.repository.findAll(params, scopeFilters);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  private async buildScopeFilters(clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    if (ctx.isPlatformAdmin) return {};
    if (ctx.recruiterId) return { recruiter_id: ctx.recruiterId };
    if (ctx.organizationIds.length > 0) {
      const { data: companies } = await this.supabase
        .from('companies').select('id')
        .in('identity_organization_id', ctx.organizationIds);
      const ids = companies?.map(c => c.id) || [];
      return ids.length > 0 ? { company_ids: ids } : null;
    }
    return null;
  }
}
