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

    const { data: jobs, total } = await this.repository.findForBoard(params);

    const jobIds = jobs.map((j: any) => j.id);
    const [skillsMap, appCounts] = await Promise.all([
      this.repository.batchFetchSkills(jobIds),
      this.repository.batchFetchApplicationCounts(jobIds),
    ]);

    const enriched = jobs.map((job: any) => ({
      ...job,
      skills: skillsMap[job.id] || [],
      application_count: appCounts[job.id] || 0,
    }));

    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);

    return {
      data: enriched,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }
}
