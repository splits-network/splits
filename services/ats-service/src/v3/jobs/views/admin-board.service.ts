/**
 * Admin Board View Service
 * Platform admin access only, no row scoping
 */

import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AdminBoardRepository } from './admin-board.repository';
import { JobListParams } from '../types';

export class AdminBoardService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: AdminBoardRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getBoard(params: JobListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Platform admin access required');
    }

    const { data, total } = await this.repository.findForBoard(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);

    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }
}
