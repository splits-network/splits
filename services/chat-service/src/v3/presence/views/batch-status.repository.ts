/**
 * Batch Status View Repository
 *
 * Redis MGET for batch presence lookup. Parses JSON values from
 * `presence:user:{identityUserId}` keys and normalizes status values.
 */

import Redis from 'ioredis';
import { PresenceEntry, PresenceStatusValue } from '../types';

export class BatchStatusRepository {
  constructor(private redis: Redis) {}

  async findByUserIds(userIds: string[]): Promise<PresenceEntry[]> {
    if (userIds.length === 0) return [];

    const keys = userIds.map((id) => `presence:user:${id}`);
    const values = await this.redis.mget(keys);

    return userIds.map((id, index) => {
      const payload = values[index];
      if (!payload) {
        return { userId: id, status: 'offline' as PresenceStatusValue, lastSeenAt: null };
      }

      try {
        const parsed = JSON.parse(payload);
        const rawStatus = parsed?.status;
        const status: PresenceStatusValue =
          rawStatus === 'online' ? 'online' :
          rawStatus === 'idle' ? 'idle' :
          'offline';

        return {
          userId: id,
          status,
          lastSeenAt: parsed?.lastSeenAt || null,
        };
      } catch {
        return { userId: id, status: 'offline' as PresenceStatusValue, lastSeenAt: null };
      }
    });
  }
}
