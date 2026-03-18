/**
 * Recruiter-Codes List View Service
 * GET /api/v3/recruiter-codes/views/list
 *
 * Scoped list with recruiter + user joins.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { RecruiterCodeListParams } from '../types';
import { RecruiterCodeListViewRepository } from './list.repository';

export class RecruiterCodeListViewService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: RecruiterCodeListViewRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: RecruiterCodeListParams, clerkUserId: string) {
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
    if (ctx.recruiterId) return { recruiter_id: ctx.recruiterId };
    return null;
  }
}
