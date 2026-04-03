/**
 * Termination Impact View Service
 */

import { BadRequestError } from '@splits-network/shared-fastify';
import { TerminationImpactRepository } from './termination-impact.repository.js';

export class TerminationImpactService {
  constructor(private repository: TerminationImpactRepository) {}

  async getImpact(recruiterId: string, companyId: string) {
    if (!recruiterId || !companyId) {
      throw new BadRequestError('recruiter_id and company_id are required');
    }

    const jobs = await this.repository.findAffected(recruiterId, companyId);
    const jobIds = jobs.map((j: any) => j.id);
    const appCounts = await this.repository.batchFetchActiveApplicationCounts(jobIds);

    return jobs.map((job: any) => ({
      id: job.id,
      title: job.title,
      status: job.status,
      created_at: job.created_at,
      application_count: appCounts[job.id] || 0,
    }));
  }
}
