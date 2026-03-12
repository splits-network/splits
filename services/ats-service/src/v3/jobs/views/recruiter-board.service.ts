/**
 * Recruiter Board View Service
 * Subscription tier gating, assigned filter, skill/app enrichment
 */

import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { RecruiterBoardRepository } from './recruiter-board.repository';
import { RecruiterSavedJobRepository } from '../../recruiter-saved-jobs/repository';
import { JobListParams } from '../types';

export class RecruiterBoardService {
  private accessResolver: AccessContextResolver;
  private savedJobRepo: RecruiterSavedJobRepository;

  constructor(
    private repository: RecruiterBoardRepository,
    supabase: SupabaseClient
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
    this.savedJobRepo = new RecruiterSavedJobRepository(supabase);
  }

  async getBoard(params: JobListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);

    if (!context.recruiterId || !context.roles.includes('recruiter')) {
      throw new ForbiddenError('Recruiter role required for this view');
    }

    // Determine visible statuses based on subscription tier
    const tier = await this.repository.getRecruiterTier(context.recruiterId);
    const visibleStatuses = tier === 'partner'
      ? ['active', 'priority', 'early']
      : ['active', 'priority'];

    // Get involved job IDs for assigned filter
    let involvedJobIds: string[] | undefined;
    if (params.job_owner_filter === 'assigned') {
      involvedJobIds = await this.repository.getInvolvedJobIds(context.recruiterId);
    }

    // Get saved job IDs for saved filter
    let savedJobIds: string[] | undefined;
    if (params.job_owner_filter === 'saved') {
      savedJobIds = await this.savedJobRepo.findJobIdsByRecruiter(context.recruiterId);
      if (savedJobIds.length === 0) {
        const page = params.page || 1;
        const limit = Math.min(params.limit || 25, 100);
        return {
          data: [],
          pagination: { total: 0, page, limit, total_pages: 0 },
        };
      }
    }

    const { data: jobs, total } = await this.repository.findForBoard(
      params, context.recruiterId, visibleStatuses, involvedJobIds, savedJobIds
    );

    // Batch-fetch enrichments
    const jobIds = jobs.map((j: any) => j.id);
    const [skillsMap, appCounts, savedMap] = await Promise.all([
      this.repository.batchFetchSkills(jobIds),
      this.repository.batchFetchApplicationCounts(jobIds),
      this.savedJobRepo.findSavedMapForJobs(context.recruiterId, jobIds),
    ]);

    const enriched = jobs.map((job: any) => ({
      ...job,
      skills: skillsMap[job.id] || [],
      application_count: appCounts[job.id] || 0,
      is_saved: savedMap.has(job.id),
      saved_record_id: savedMap.get(job.id) || null,
    }));

    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data: enriched,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }
}
