import { CacheManager } from '../../cache/cache-manager';
import { ProposalStatsRepository } from './repository';
import { ProposalSummary, ProposalStatsFilters } from './types';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { SupabaseClient } from '@supabase/supabase-js';

export class ProposalStatsService {
    constructor(
        private repository: ProposalStatsRepository,
        private cache: CacheManager,
        private supabase: SupabaseClient
    ) {}

    async getSummary(clerkUserId: string, filters: ProposalStatsFilters): Promise<ProposalSummary> {
        // Get access context for cache key
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Cache key based on user ID and filters
        const cacheKey = `proposal-stats:summary:${context.identityUserId}:${JSON.stringify(filters)}`;

        // Try cache first (1-minute TTL)
        try {
            const cached = await this.cache.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (error) {
            console.warn('Cache read failed, falling back to database', error);
        }

        // Fetch from database
        const summary = await this.repository.getSummary(clerkUserId, filters);

        // Cache for 1 minute (stats refresh frequently)
        try {
            await this.cache.set(cacheKey, JSON.stringify(summary), 60);
        } catch (error) {
            console.warn('Cache write failed, continuing without cache', error);
        }

        return summary;
    }

    /**
     * Invalidate cache for a specific user
     */
    async invalidateCache(userId: string): Promise<void> {
        try {
            await this.cache.invalidatePattern(`proposal-stats:summary:${userId}:*`);
        } catch (error) {
            console.warn('Cache invalidation failed', error);
        }
    }
}
