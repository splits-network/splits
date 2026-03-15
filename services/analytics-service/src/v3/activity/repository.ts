/**
 * Activity V3 Repository
 *
 * Thin wrapper — activity data lives in Redis, not Supabase.
 * Delegates to ActivityService from V2 which handles Redis directly.
 */

import { ActivityService } from '../../v2/activity/service';
import { HeartbeatInput } from './types';

export class ActivityRepository {
  constructor(private activityService: ActivityService) {}

  async recordHeartbeat(payload: HeartbeatInput): Promise<void> {
    await this.activityService.recordHeartbeat(payload as any);
  }

  async getSnapshot(): Promise<any> {
    return this.activityService.getSnapshot();
  }
}
