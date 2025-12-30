import { buildPaginationResponse } from '../shared/helpers';
import { MetricFilters, MetricUpdate } from './types';
import { CreateMetricInput, MarketplaceMetricsRepository } from './repository';
import { EventPublisher } from '../shared/events';

export class MarketplaceMetricsServiceV2 {
    constructor(
        private repository: MarketplaceMetricsRepository,
        private eventPublisher?: EventPublisher
    ) {}

    async listMetrics(filters: MetricFilters) {
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

    async getMetric(id: string) {
        const metric = await this.repository.findMetric(id);
        if (!metric) {
            throw new Error('Marketplace metric not found');
        }
        return metric;
    }

    async createMetric(input: CreateMetricInput) {
        const metric = await this.repository.createMetric(input);
        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.metrics.created', {
                metric_id: metric.id,
                date: metric.date,
            });
        }
        return metric;
    }

    async updateMetric(id: string, updates: MetricUpdate) {
        await this.getMetric(id);
        const metric = await this.repository.updateMetric(id, updates);
        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.metrics.updated', {
                metric_id: id,
                updates,
            });
        }
        return metric;
    }

    async deleteMetric(id: string) {
        await this.getMetric(id);
        await this.repository.deleteMetric(id);
        if (this.eventPublisher) {
            await this.eventPublisher.publish('automation.metrics.deleted', {
                metric_id: id,
            });
        }
    }
}
