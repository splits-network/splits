/**
 * Candidate Listing View Service
 * Salary visibility enforcement, skill enrichment
 */

import { CandidateListingRepository } from './candidate-listing.repository.js';
import { JobListParams } from '../types.js';

export class CandidateListingService {
  constructor(private repository: CandidateListingRepository) {}

  async getListing(params: JobListParams, clerkUserId?: string) {
    const { data: jobs, total } = await this.repository.findForListing(params);

    const jobIds = jobs.map((j: any) => j.id);
    const [skillsMap, scoresMap] = await Promise.all([
      this.repository.batchFetchSkills(jobIds),
      this.resolveMatchScores(clerkUserId, jobIds),
    ]);

    // Enforce salary visibility, enrich with skills + match score
    const shaped = jobs.map((job: any) => {
      const result: any = {
        ...job,
        skills: skillsMap[job.id] || [],
        match_score: scoresMap[job.id] ?? null,
      };
      if (!job.show_salary_range) {
        delete result.salary_min;
        delete result.salary_max;
      }
      delete result.show_salary_range;
      return result;
    });

    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data: shaped,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  /** Resolve match scores only when authenticated and candidate exists */
  private async resolveMatchScores(
    clerkUserId: string | undefined,
    jobIds: string[],
  ): Promise<Record<string, number>> {
    if (!clerkUserId || jobIds.length === 0) return {};
    try {
      const candidateId = await this.repository.resolveCandidateId(clerkUserId);
      if (!candidateId) return {};
      return await this.repository.batchFetchMatchScores(candidateId, jobIds);
    } catch {
      return {};
    }
  }
}
