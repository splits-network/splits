/**
 * Stats V3 Repository
 *
 * Delegates to V2 StatsRepository for real-time computation.
 * The V2 repo has 900+ lines of parallel queries across source tables.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { StatsServiceV2 } from '../../v2/stats/service.js';
import { PlatformSummary, StatsQueryParams } from './types.js';

export class StatsV3Repository {
  constructor(
    private statsServiceV2: StatsServiceV2,
    private supabase: SupabaseClient,
  ) {}

  async getStats(clerkUserId: string, params: StatsQueryParams) {
    return this.statsServiceV2.getStats(clerkUserId, params);
  }

  async getPlatformActivity(clerkUserId: string) {
    return this.statsServiceV2.getPlatformActivity(clerkUserId);
  }

  async getTopPerformers(clerkUserId: string) {
    return this.statsServiceV2.getTopPerformers(clerkUserId);
  }

  async getPlatformSummary(): Promise<PlatformSummary> {
    const { data, error } = await this.supabase
      .schema('analytics')
      .from('marketplace_health_daily')
      .select('active_jobs, total_recruiters, active_companies, cumulative_placements, metric_date')
      .order('metric_date', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return {
        active_jobs: 0,
        total_recruiters: 0,
        active_companies: 0,
        cumulative_placements: 0,
        as_of: null,
      };
    }

    return {
      active_jobs: data.active_jobs ?? 0,
      total_recruiters: data.total_recruiters ?? 0,
      active_companies: data.active_companies ?? 0,
      cumulative_placements: data.cumulative_placements ?? 0,
      as_of: data.metric_date,
    };
  }
}
