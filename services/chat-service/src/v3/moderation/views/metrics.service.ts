/**
 * Metrics View Service
 *
 * Admin-only metrics aggregation for chat moderation dashboard.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { ForbiddenError } from '@splits-network/shared-fastify';
import { MetricsRepository } from './metrics.repository';
import { ModerationMetrics } from '../types';

export class MetricsService {
  private accessResolver: AccessContextResolver;

  constructor(
    private repository: MetricsRepository,
    supabase: SupabaseClient,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getMetrics(rangeDays: number, clerkUserId: string): Promise<ModerationMetrics> {
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.isPlatformAdmin) {
      throw new ForbiddenError('Admin privileges required');
    }

    const safeRange = Number.isFinite(rangeDays) && rangeDays > 0 ? rangeDays : 7;
    return this.repository.getMetrics(safeRange);
  }
}
