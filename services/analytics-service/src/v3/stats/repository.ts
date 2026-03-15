/**
 * Stats V3 Repository
 *
 * Delegates to V2 StatsRepository for real-time computation.
 * The V2 repo has 900+ lines of parallel queries across source tables.
 */

import { StatsServiceV2 } from '../../v2/stats/service';
import { StatsQueryParams } from './types';

export class StatsV3Repository {
  constructor(private statsServiceV2: StatsServiceV2) {}

  async getStats(clerkUserId: string, params: StatsQueryParams) {
    return this.statsServiceV2.getStats(clerkUserId, params);
  }

  async getPlatformActivity(clerkUserId: string) {
    return this.statsServiceV2.getPlatformActivity(clerkUserId);
  }

  async getTopPerformers(clerkUserId: string) {
    return this.statsServiceV2.getTopPerformers(clerkUserId);
  }
}
