/**
 * Candidate Detail View Service
 * Salary visibility enforcement, status gating
 */

import { NotFoundError } from '@splits-network/shared-fastify';
import { CandidateDetailRepository } from './candidate-detail.repository';

export class CandidateDetailService {
  constructor(private repository: CandidateDetailRepository) {}

  async getDetail(id: string) {
    const job = await this.repository.findById(id);
    if (!job) throw new NotFoundError('Job', id);

    const [requirements, skills] = await Promise.all([
      this.repository.findRequirements(id),
      this.repository.findSkills(id),
    ]);

    const result: any = { ...job, requirements, skills };

    // Enforce salary visibility
    if (!job.show_salary_range) {
      delete result.salary_min;
      delete result.salary_max;
    }
    delete result.show_salary_range;

    return result;
  }
}
