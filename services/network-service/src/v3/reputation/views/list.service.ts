/**
 * Reputation List View Service
 * GET /api/v3/reputation/views/list
 *
 * Reputation records with recruiter details.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { ReputationListParams } from '../types';
import { ReputationListViewRepository } from './list.repository';

export class ReputationListViewService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: ReputationListViewRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: ReputationListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin && !context.recruiterId) {
      throw new ForbiddenError('You do not have access to reputation records');
    }

    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }
}
