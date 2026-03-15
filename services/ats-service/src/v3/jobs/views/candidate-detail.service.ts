/**
 * Candidate Detail View Service
 * Salary visibility enforcement, status gating
 */

import { NotFoundError } from '@splits-network/shared-fastify';
import { CandidateDetailRepository } from './candidate-detail.repository';

export class CandidateDetailService {
  constructor(private repository: CandidateDetailRepository) {}

  async getDetail(id: string, clerkUserId?: string) {
    const job = await this.repository.findById(id);
    if (!job) throw new NotFoundError('Job', id);

    const [requirements, skills, matchScore] = await Promise.all([
      this.repository.findRequirements(id),
      this.repository.findSkills(id),
      this.resolveMatchScore(clerkUserId, id),
    ]);

    const result: any = { ...job, requirements, skills, match_score: matchScore };

    // Enforce salary visibility
    if (!job.show_salary_range) {
      delete result.salary_min;
      delete result.salary_max;
    }
    delete result.show_salary_range;

    return result;
  }

  /** Resolve match score only when authenticated and candidate exists */
  private async resolveMatchScore(
    clerkUserId: string | undefined,
    jobId: string,
  ): Promise<number | null> {
    if (!clerkUserId) return null;
    try {
      const candidateId = await this.repository.resolveCandidateId(clerkUserId);
      if (!candidateId) return null;
      return await this.repository.findMatchScore(candidateId, jobId);
    } catch {
      return null;
    }
  }
}
