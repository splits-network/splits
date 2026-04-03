/**
 * Marketplace Metrics V3 Service — Read-only, admin-only
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { NotFoundError, ForbiddenError } from '@splits-network/shared-fastify';
import { MetricRepository } from './repository.js';
import { MetricListParams } from './types.js';

export class MetricService {
  private accessResolver: AccessContextResolver;

  constructor(private repository: MetricRepository, private supabase: SupabaseClient) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getAll(params: MetricListParams, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) throw new ForbiddenError('Admin access required');
    const { data, total } = await this.repository.findAll(params);
    const page = params.page || 1;
    const limit = Math.min(params.limit || 25, 100);
    return { data, pagination: { total, page, limit, total_pages: Math.ceil(total / limit) } };
  }

  async getById(id: string, clerkUserId: string) {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) throw new ForbiddenError('Admin access required');
    const metric = await this.repository.findById(id);
    if (!metric) throw new NotFoundError('Metric', id);
    return metric;
  }
}
