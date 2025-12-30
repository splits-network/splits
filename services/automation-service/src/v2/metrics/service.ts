import { buildPaginationResponse } from '../shared/helpers';
import { MetricFilters, MetricUpdate } from './types';
import { CreateMetricInput, MarketplaceMetricsRepository } from './repository';
import { EventPublisher } from '../shared/events';
import type { AccessContext } from '../shared/access';

export class MarketplaceMetricsServiceV2 {
    constructor(
        private repository: MarketplaceMetricsRepository,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>,
        private eventPublisher?: EventPublisher
    ) {}

    private async requirePlatformAdmin(clerkUserId: string): Promise<AccessContext> {
        const access = await this.resolveAccessContext(clerkUserId);
        if (!access.isPlatformAdmin) {
            throw new Error('Platform admin permissions required');
        }
        return access;
    }

    async listMetrics(clerkUserId: string, filters: MetricFilters) {
        await this.requirePlatformAdmin(clerkUserId);
        const result = await this.repository.findMetrics(filters);
        return {
            data: result.data,
            pagination: buildPaginationResponse(
                filters.page ?? 1,
                filters.limit ?? 25,
                result.total
            ),
        };
    }

    async getMetric(clerkUserId: string, id: string) {
        await this.requirePlatformAdmin(clerkUserId);
        const metric = await this.repository.findMetric(id);
        if (!metric) {
            throw new Error('Marketplace metric not found');
        }
        return metric;
    }

    async createMetric(clerkUserId: string, input: CreateMetricInput) {
        await this.requirePlatformAdmin(clerkUserId);
        const metric = await this.repository.createMetric(input);
        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.metrics.created', {
                metric_id: metric.id,
                date: metric.date,
            });
        }
        return metric;
    }

    async updateMetric(clerkUserId: string, id: string, updates: MetricUpdate) {
        await this.requirePlatformAdmin(clerkUserId);
        await this.getMetric(clerkUserId, id);
        const metric = await this.repository.updateMetric(id, updates);
        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.metrics.updated', {
                metric_id: id,
                updates,
            });
        }
        return metric;
    }

    async deleteMetric(clerkUserId: string, id: string) {
        await this.requirePlatformAdmin(clerkUserId);
        await this.getMetric(clerkUserId, id);
        await this.repository.deleteMetric(id);
        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.metrics.deleted', {
                metric_id: id,
            });
        }
    }
}
