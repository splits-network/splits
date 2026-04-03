/**
 * Firms List View Service
 * GET /api/v3/firms/views/list
 *
 * Scoped list with member stats enrichment.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { FirmListParams } from '../types.js';
import { FirmListViewRepository } from './list.repository.js';

export class FirmListViewService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: FirmListViewRepository,
    private supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: FirmListParams, clerkUserId: string) {
    const scopeFilters = await this.buildScopeFilters(clerkUserId);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    if (scopeFilters === null) return { data: [], pagination: { total: 0, page, limit, total_pages: 0 } };
    const { data, total } = await this.repository.findAll(params, scopeFilters);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  private async buildScopeFilters(clerkUserId: string) {
    const ctx = await this.accessResolver.resolve(clerkUserId);
    if (ctx.isPlatformAdmin) return {};
    if (ctx.recruiterId) {
      const { data: memberFirmIds } = await this.supabase
        .from('firm_members').select('firm_id')
        .eq('recruiter_id', ctx.recruiterId).eq('status', 'active');
      const firmIds = (memberFirmIds || []).map((m: any) => m.firm_id);
      return firmIds.length > 0 ? { firm_ids: firmIds } : null;
    }
    if (ctx.organizationIds.length > 0) return { billing_organization_ids: ctx.organizationIds };
    return null;
  }
}
