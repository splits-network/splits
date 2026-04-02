/**
 * Job Skills V3 Service
 */

import { BadRequestError } from '@splits-network/shared-fastify';
import { JobSkillRepository } from './repository.js';
import { CreateJobSkillInput, JobSkillListParams } from './types.js';

export class JobSkillService {
  constructor(private repository: JobSkillRepository) {}

  async getAll(params: JobSkillListParams) {
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 100, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async add(input: CreateJobSkillInput) {
    if (!input.job_id) throw new BadRequestError('job_id is required');
    if (!input.skill_id) throw new BadRequestError('skill_id is required');
    return this.repository.add(input.job_id, input.skill_id, input.is_required ?? true);
  }

  async remove(jobId: string, skillId: string) {
    if (!jobId) throw new BadRequestError('jobId is required');
    if (!skillId) throw new BadRequestError('skillId is required');
    await this.repository.remove(jobId, skillId);
  }
}
