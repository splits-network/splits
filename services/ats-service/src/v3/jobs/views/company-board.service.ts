/**
 * Company Board View Service
 * Org scoping, application count enrichment
 */

import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { CompanyBoardRepository } from './company-board.repository';
import { JobListParams } from '../types';

export class CompanyBoardService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: CompanyBoardRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getBoard(params: JobListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

    if (context.organizationIds.length === 0 && !context.isPlatformAdmin) {
      throw new ForbiddenError('Company role required for this view');
    }

    const companyIds = context.isPlatformAdmin
      ? [] // admin handled differently
      : await this.repository.getCompanyIdsForOrg(context.organizationIds);

    if (!context.isPlatformAdmin && companyIds.length === 0) {
      return { data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 } };
    }

    const { data: jobs, total } = await this.repository.findForBoard(
      params, companyIds, context.identityUserId ?? undefined
    );

    const jobIds = jobs.map((j: any) => j.id);
    const [appCounts, skillsMap] = await Promise.all([
      this.repository.batchFetchApplicationCounts(jobIds),
      this.repository.batchFetchSkills(jobIds),
    ]);

    const enriched = jobs.map((job: any) => ({
      ...job,
      skills: skillsMap[job.id] || [],
      application_count: appCounts.total[job.id] || 0,
      total_applications: appCounts.total[job.id] || 0,
      active_applications: appCounts.active[job.id] || 0,
    }));

    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data: enriched,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }
}
