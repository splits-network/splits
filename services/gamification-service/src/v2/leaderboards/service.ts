import { LeaderboardRepository } from './repository';
import { LeaderboardFilters, LeaderboardPeriod } from './types';
import { BadgeEntityType } from '../badges/definitions/types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { buildPaginationResponse } from '../shared/pagination';
import { Logger } from '@splits-network/shared-logging';

export class LeaderboardService {
    private supabase: SupabaseClient;

    constructor(
        private repository: LeaderboardRepository,
        supabaseUrl: string,
        supabaseKey: string,
        private logger: Logger
    ) {
        this.supabase = createClient(supabaseUrl, supabaseKey, { db: { schema: 'public' } });
    }

    async getLeaderboard(filters: LeaderboardFilters) {
        const result = await this.repository.getLeaderboard(filters);
        return buildPaginationResponse(result.data, result.total, filters.page || 1, filters.limit || 25);
    }

    async getEntityRank(
        entityType: BadgeEntityType,
        entityId: string,
        period: LeaderboardPeriod,
        metric: string
    ) {
        return this.repository.getEntityRank(entityType, entityId, period, metric);
    }

    /**
     * Compute and materialize leaderboard rankings for a given period and metric.
     * Called by the scheduler.
     */
    async computeLeaderboard(
        entityType: BadgeEntityType,
        period: LeaderboardPeriod,
        metric: string
    ): Promise<void> {
        const periodStart = this.getPeriodStart(period);

        this.logger.info({ entityType, period, metric, periodStart }, 'Computing leaderboard');

        // Fetch scores based on metric
        const scores = await this.fetchScores(entityType, metric, periodStart);

        // Rank entities by score descending
        const ranked = scores
            .sort((a, b) => b.score - a.score)
            .map((entry, index) => ({
                entity_type: entityType,
                entity_id: entry.entity_id,
                period,
                period_start: periodStart,
                rank: index + 1,
                score: entry.score,
                metric,
                metadata: entry.metadata || {},
            }));

        await this.repository.upsertEntries(ranked);
        this.logger.info({ entityType, period, metric, entries: ranked.length }, 'Leaderboard computed');
    }

    private getPeriodStart(period: LeaderboardPeriod): string {
        const now = new Date();
        switch (period) {
            case 'weekly': {
                const day = now.getDay();
                const diff = now.getDate() - day + (day === 0 ? -6 : 1);
                return new Date(now.getFullYear(), now.getMonth(), diff).toISOString().split('T')[0];
            }
            case 'monthly':
                return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            case 'quarterly': {
                const quarter = Math.floor(now.getMonth() / 3);
                return new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
            }
            case 'all_time':
                return '2024-01-01';
        }
    }

    private async fetchScores(
        entityType: BadgeEntityType,
        metric: string,
        periodStart: string
    ): Promise<Array<{ entity_id: string; score: number; metadata?: Record<string, any> }>> {
        if (metric === 'total_xp') {
            const { data, error } = await this.supabase
                .from('entity_levels')
                .select('entity_id, total_xp')
                .eq('entity_type', entityType)
                .gt('total_xp', 0)
                .order('total_xp', { ascending: false })
                .limit(500);

            if (error) throw error;
            return (data || []).map(row => ({ entity_id: row.entity_id, score: row.total_xp }));
        }

        if (metric === 'placements' && entityType === 'recruiter') {
            const { data, error } = await this.supabase
                .from('recruiter_reputation')
                .select('recruiter_id, completed_placements')
                .gt('completed_placements', 0)
                .order('completed_placements', { ascending: false })
                .limit(500);

            if (error) throw error;
            return (data || []).map(row => ({
                entity_id: row.recruiter_id,
                score: row.completed_placements,
            }));
        }

        if (metric === 'hire_rate' && entityType === 'recruiter') {
            const { data, error } = await this.supabase
                .from('recruiter_reputation')
                .select('recruiter_id, hire_rate, total_submissions')
                .gt('total_submissions', 5)
                .gt('hire_rate', 0)
                .order('hire_rate', { ascending: false })
                .limit(500);

            if (error) throw error;
            return (data || []).map(row => ({
                entity_id: row.recruiter_id,
                score: row.hire_rate,
            }));
        }

        return [];
    }
}
