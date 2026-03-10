/**
 * Job Requirements V3 Service
 */

import { NotFoundError } from '@splits-network/shared-fastify';
import { JobRequirementRepository } from './repository';
import { CreateJobRequirementInput, UpdateJobRequirementInput, JobRequirementListParams } from './types';

export class JobRequirementService {
  constructor(private repository: JobRequirementRepository) {}

  async getAll(params: JobRequirementListParams) {
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 100, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string) {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundError('JobRequirement', id);
    return item;
  }

  async create(input: CreateJobRequirementInput) {
    return this.repository.create(input);
  }

  async update(id: string, input: UpdateJobRequirementInput) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('JobRequirement', id);
    const updated = await this.repository.update(id, input);
    if (!updated) throw new NotFoundError('JobRequirement', id);
    return updated;
  }

  async delete(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('JobRequirement', id);
    await this.repository.delete(id);
  }
}
