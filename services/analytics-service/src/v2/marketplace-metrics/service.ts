import { MarketplaceMetricsRepository } from './repository';
import { MetricFilters, MetricUpdate, CreateMetricInput } from './types';
import { EventPublisher } from '../shared/events';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Service for marketplace metrics operations
 * Requires platform admin access for all operations
 */
export class MarketplaceMetricsServiceV2 {
    constructor(
        private repository: MarketplaceMetricsRepository,
        private supabase: SupabaseClient,
        private eventPublisher?: EventPublisher
    ) { }

    /**
     * Require platform admin access
     */
    private async requirePlatformAdmin(clerkUserId: string): Promise<void> {
        const access = await resolveAccessContext(this.supabase, clerkUserId);
        if (!access.isPlatformAdmin) {
            throw new Error('Platform admin permissions required');
        }
    }

    /**
     * List marketplace metrics with filters
     */
    async list(clerkUserId: string, filters: MetricFilters) {
        await this.requirePlatformAdmin(clerkUserId);
        return await this.repository.list(filters);
    }

    /**
     * Get single marketplace metric by ID
     */
    async get(clerkUserId: string, id: string) {
        await this.requirePlatformAdmin(clerkUserId);
        const metric = await this.repository.findById(id);
        if (!metric) {
            throw new Error('Marketplace metric not found');
        }
        return metric;
    }

    /**
     * Create new marketplace metric
     */
    async create(clerkUserId: string, input: CreateMetricInput) {
        await this.requirePlatformAdmin(clerkUserId);

        // Validate required fields
        if (!input.date) {
            throw new Error('date is required');
        }
        if (typeof input.total_placements === 'undefined') {
            throw new Error('total_placements is required');
        }
        if (typeof input.total_applications === 'undefined') {
            throw new Error('total_applications is required');
        }
        if (typeof input.total_earnings_cents === 'undefined') {
            throw new Error('total_earnings_cents is required');
        }
        if (typeof input.active_recruiters === 'undefined') {
            throw new Error('active_recruiters is required');
        }
        if (typeof input.active_jobs === 'undefined') {
            throw new Error('active_jobs is required');
        }
        if (typeof input.health_score === 'undefined') {
            throw new Error('health_score is required');
        }

        const metric = await this.repository.create(input);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('analytics.marketplace_metric.created', {
                metricId: metric.id,
                date: metric.date,
            });
        }

        return metric;
    }

    /**
     * Update marketplace metric
     */
    async update(clerkUserId: string, id: string, updates: MetricUpdate) {
        await this.requirePlatformAdmin(clerkUserId);

        // Ensure metric exists
        await this.get(clerkUserId, id);

        const metric = await this.repository.update(id, updates);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('analytics.marketplace_metric.updated', {
                metricId: id,
                changes: Object.keys(updates),
            });
        }

        return metric;
    }

    /**
     * Delete marketplace metric
     */
    async delete(clerkUserId: string, id: string) {
        await this.requirePlatformAdmin(clerkUserId);

        // Ensure metric exists
        await this.get(clerkUserId, id);

        await this.repository.delete(id);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('analytics.marketplace_metric.deleted', {
                metricId: id,
            });
        }
    }
}
