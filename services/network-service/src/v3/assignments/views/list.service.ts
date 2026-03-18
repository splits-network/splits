/**
 * Assignments List View Service
 * GET /api/v3/assignments/views/list
 *
 * Scoped list with recruiter + job + company joins.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { AssignmentListParams } from '../types';
import { AssignmentListViewRepository } from './list.repository';

export class AssignmentListViewService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: AssignmentListViewRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: AssignmentListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    const scopeFilters: { recruiter_id?: string; organization_ids?: string[] } = {};

    if (context.recruiterId) {
      scopeFilters.recruiter_id = context.recruiterId;
    } else if (!context.isPlatformAdmin) {
      if (context.organizationIds.length === 0) {
        return this.emptyPage(params);
      }
      scopeFilters.organization_ids = context.organizationIds;
    }

    const { data, total } = await this.repository.findAll(params, scopeFilters);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  private emptyPage(params: AssignmentListParams) {
    return {
      data: [],
      pagination: { total: 0, page: params.page || 1, limit: params.limit || 25, total_pages: 0 },
    };
  }
}
