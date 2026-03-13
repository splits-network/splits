/**
 * Marketplace Metrics V3 Service — Business Logic
 *
 * Admin-only CRUD on marketplace_health_daily.
 * No HTTP concepts. Typed errors only.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { MarketplaceMetricRepository } from './repository';
import {
  CreateMetricInput,
  UpdateMetricInput,
  MarketplaceMetricListParams,
} from './types';

export class MarketplaceMetricService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: MarketplaceMetricRepository,
    private supabase: SupabaseClient,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  private async requireAdmin(clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Only platform admins can manage marketplace metrics');
    }
    return context;
  }

  async getAll(params: MarketplaceMetricListParams, clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return {
      data,
      pagination: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string, clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    const metric = await this.repository.findById(id);
    if (!metric) throw new NotFoundError('MarketplaceMetric', id);
    return metric;
  }

  async create(input: CreateMetricInput, clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    return this.repository.create(input);
  }

  async update(id: string, input: UpdateMetricInput, clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('MarketplaceMetric', id);
    return this.repository.update(id, input);
  }

  async delete(id: string, clerkUserId: string) {
    await this.requireAdmin(clerkUserId);
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('MarketplaceMetric', id);
    await this.repository.delete(id);
  }
}
