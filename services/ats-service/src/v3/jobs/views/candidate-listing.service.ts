/**
 * Candidate Listing View Service
 * Salary visibility enforcement, skill enrichment
 */

import { CandidateListingRepository } from './candidate-listing.repository';
import { JobListParams } from '../types';

export class CandidateListingService {
  constructor(private repository: CandidateListingRepository) {}

  async getListing(params: JobListParams) {
    const { data: jobs, total } = await this.repository.findForListing(params);

    const jobIds = jobs.map((j: any) => j.id);
    const skillsMap = await this.repository.batchFetchSkills(jobIds);

    // Enforce salary visibility and strip internal fields
    const shaped = jobs.map((job: any) => {
      const result: any = { ...job, skills: skillsMap[job.id] || [] };
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
}
