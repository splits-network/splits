/**
 * Providers V3 Service
 * Read-only provider catalog
 */

import { NotFoundError } from '@splits-network/shared-fastify';
import { ProviderRepository } from './repository.js';
import { ProviderListParams } from './types.js';

export class ProviderService {
  constructor(private repository: ProviderRepository) {}

  async getAll(params: ProviderListParams) {
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getBySlug(slug: string) {
    const provider = await this.repository.findBySlug(slug);
    if (!provider) throw new NotFoundError('Provider', slug);
    return provider;
  }
}
