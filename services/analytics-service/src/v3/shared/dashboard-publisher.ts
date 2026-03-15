/**
 * V3 Dashboard Publisher
 *
 * Publishes real-time dashboard events to Redis pub/sub so the
 * analytics-gateway can fan them out to connected WebSocket clients.
 *
 * Channel naming convention (preserved from V2):
 *   dashboard:recruiter:<recruiterId>   — per-recruiter stats/charts
 *   dashboard:<userId>                  — per-user generic updates
 *   dashboard:activity                  — global activity feed
 */

import Redis from 'ioredis';
import { createLogger } from '@splits-network/shared-logging';

const logger = createLogger('v3:DashboardPublisher');

export interface DashboardEvent {
  type: 'stats.updated' | 'chart.invalidated' | 'activity.updated';
  eventVersion: number;
  serverTime: string;
  data?: {
    /** Which metric categories changed */
    metrics?: string[];
    /** Which chart types should be refreshed */
    charts?: string[];
    /** Activity snapshot payload */
    snapshot?: Record<string, unknown>;
  };
}

const DEFAULT_CHART_TYPES = [
  'placement-trends',
  'submission-trends',
  'earnings-trends',
  'time-to-place-trends',
];

export class DashboardPublisher {
  constructor(private redis: Redis) {}

  /**
   * Notify a specific recruiter's dashboard that stats have changed.
   */
  async publishRecruiterUpdate(recruiterId: string, changedMetrics?: string[]): Promise<void> {
    const event: DashboardEvent = {
      type: 'stats.updated',
      eventVersion: 1,
      serverTime: new Date().toISOString(),
      data: {
        metrics: changedMetrics || ['all'],
        charts: DEFAULT_CHART_TYPES,
      },
    };
    await this.publish(`dashboard:recruiter:${recruiterId}`, event);
  }

  /**
   * Notify a user-level dashboard channel.
   */
  async publishUserUpdate(userId: string, changedMetrics?: string[]): Promise<void> {
    const event: DashboardEvent = {
      type: 'stats.updated',
      eventVersion: 1,
      serverTime: new Date().toISOString(),
      data: { metrics: changedMetrics || ['all'] },
    };
    await this.publish(`dashboard:${userId}`, event);
  }

  /**
   * Invalidate specific chart types for a recruiter.
   */
  async invalidateCharts(recruiterId: string, chartTypes: string[]): Promise<void> {
    const event: DashboardEvent = {
      type: 'chart.invalidated',
      eventVersion: 1,
      serverTime: new Date().toISOString(),
      data: { charts: chartTypes },
    };
    await this.publish(`dashboard:recruiter:${recruiterId}`, event);
  }

  /**
   * Publish a global activity snapshot (online counts, recent actions).
   */
  async publishActivitySnapshot(snapshot: Record<string, unknown>): Promise<void> {
    const event: DashboardEvent = {
      type: 'activity.updated',
      eventVersion: 1,
      serverTime: new Date().toISOString(),
      data: { snapshot },
    };
    await this.publish('dashboard:activity', event);
  }

  private async publish(channel: string, event: DashboardEvent): Promise<void> {
    try {
      await this.redis.publish(channel, JSON.stringify(event));
    } catch (err) {
      logger.warn({ err, channel }, 'Failed to publish dashboard event (non-critical)');
    }
  }
}
