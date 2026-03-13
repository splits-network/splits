/**
 * Stats V3 Service — Business Logic
 *
 * Delegates to V2 StatsServiceV2 which handles scope resolution,
 * access control, and real-time metric computation.
 * No HTTP concepts. Typed errors only.
 */

import { StatsV3Repository } from './repository';
import { StatsQueryParams } from './types';

export class StatsV3Service {
  constructor(private repository: StatsV3Repository) {}

  async getStats(clerkUserId: string, params: StatsQueryParams) {
    return this.repository.getStats(clerkUserId, params);
  }

  async getPlatformActivity(clerkUserId: string) {
    return this.repository.getPlatformActivity(clerkUserId);
  }

  async getTopPerformers(clerkUserId: string) {
    return this.repository.getTopPerformers(clerkUserId);
  }
}
