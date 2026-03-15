/**
 * Charts V3 Service — Business Logic
 *
 * Delegates to V2 ChartServiceV2 for chart data generation.
 * V2 service has complex fallback logic per chart type that we reuse.
 * No HTTP concepts. Typed errors only.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { BadRequestError } from '@splits-network/shared-fastify';
import { ChartServiceV2 } from '../../v2/charts/service';
import { ChartType, ChartFilters } from './types';

export class ChartV3Service {
  private accessResolver: AccessContextResolver;

  constructor(
    private chartServiceV2: ChartServiceV2,
    private supabase: SupabaseClient,
  ) {
    this.accessResolver = new AccessContextResolver(supabase);
  }

  async getChartData(clerkUserId: string, type: ChartType, filters: ChartFilters) {
    // Calculate months from date range if provided
    let months = filters.months || 12;
    if (filters.start_date && filters.end_date) {
      const start = new Date(filters.start_date);
      const end = new Date(filters.end_date);
      const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      months = Math.max(1, Math.round(daysDiff / 30));
    }

    const v2Filters = {
      months,
      recruiter_id: filters.recruiter_id,
      company_id: filters.company_id,
      scope: filters.scope,
    };

    return this.chartServiceV2.getChartData(clerkUserId, type, v2Filters);
  }
}
