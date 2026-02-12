/**
 * Dashboard Event Publisher
 *
 * Publishes real-time events to Redis so the analytics-gateway
 * can fan them out to connected dashboard WebSocket clients.
 */

import Redis from 'ioredis';

export interface DashboardEvent {
    type: 'stats.updated' | 'chart.invalidated';
    eventVersion: number;
    serverTime: string;
    data?: {
        /** Which metric categories changed */
        metrics?: string[];
        /** Which chart types should be refreshed */
        charts?: string[];
    };
}

export class DashboardEventPublisher {
    constructor(private redis: Redis) {}

    /**
     * Notify a specific recruiter's dashboard that stats have changed.
     */
    async publishRecruiterUpdate(recruiterId: string, changedMetrics?: string[]) {
        const event: DashboardEvent = {
            type: 'stats.updated',
            eventVersion: 1,
            serverTime: new Date().toISOString(),
            data: {
                metrics: changedMetrics || ['all'],
                charts: ['placement-trends', 'submission-trends', 'earnings-trends', 'time-to-place-trends'],
            },
        };
        await this.publish(`dashboard:recruiter:${recruiterId}`, event);
    }

    /**
     * Notify a user-level dashboard channel.
     */
    async publishUserUpdate(userId: string, changedMetrics?: string[]) {
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
    async invalidateCharts(recruiterId: string, chartTypes: string[]) {
        const event: DashboardEvent = {
            type: 'chart.invalidated',
            eventVersion: 1,
            serverTime: new Date().toISOString(),
            data: { charts: chartTypes },
        };
        await this.publish(`dashboard:recruiter:${recruiterId}`, event);
    }

    private async publish(channel: string, event: DashboardEvent) {
        try {
            await this.redis.publish(channel, JSON.stringify(event));
        } catch (err) {
            console.error(`[DashboardEvents] Failed to publish to ${channel}:`, err);
        }
    }
}
