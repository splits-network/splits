import { LeaderboardRepository } from './repository.js';
import { LeaderboardEntry, LeaderboardFilters, LeaderboardPeriod } from './types.js';
import { BadgeEntityType } from '../badges/definitions/types.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { buildPaginationResponse } from '../shared/pagination.js';
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
        const enriched = await this.enrichEntries(result.data, filters.entity_type);
        return buildPaginationResponse(enriched, result.total, filters.page || 1, filters.limit || 25);
    }

    async getEntityRank(
        entityType: BadgeEntityType,
        entityId: string,
        period: LeaderboardPeriod,
        metric: string
    ) {
        const entry = await this.repository.getEntityRank(entityType, entityId, period, metric);
        if (!entry) return null;
        const [enriched] = await this.enrichEntries([entry], entityType);
        return enriched;
    }

    private async enrichEntries(
        entries: LeaderboardEntry[],
        entityType: BadgeEntityType
    ): Promise<LeaderboardEntry[]> {
        if (entries.length === 0) return entries;

        const entityIds = entries.map(e => e.entity_id);
        const nameMap = new Map<string, { display_name: string; avatar_url?: string }>();

        try {
            if (entityType === 'recruiter') {
                // Two-step: get user_ids from recruiters, then names from users
                const { data: recruiters } = await this.supabase
                    .from('recruiters')
                    .select('id, user_id')
                    .in('id', entityIds);
                const recruiterUserMap = new Map<string, string>();
                const userIds: string[] = [];
                for (const r of recruiters || []) {
                    if (r.user_id) {
                        recruiterUserMap.set(r.user_id, r.id);
                        userIds.push(r.user_id);
                    }
                }
                if (userIds.length > 0) {
                    const { data: users } = await this.supabase
                        .from('users')
                        .select('id, name, profile_image_url')
                        .in('id', userIds);
                    for (const u of users || []) {
                        const recruiterId = recruiterUserMap.get(u.id);
                        if (recruiterId) {
                            nameMap.set(recruiterId, {
                                display_name: u.name || 'Recruiter',
                                avatar_url: u.profile_image_url || undefined,
                            });
                        }
                    }
                }
            } else if (entityType === 'candidate') {
                const { data } = await this.supabase
                    .from('candidates')
                    .select('id, full_name')
                    .in('id', entityIds);
                for (const row of data || []) {
                    nameMap.set(row.id, { display_name: row.full_name || 'Candidate' });
                }
            } else if (entityType === 'company') {
                const { data } = await this.supabase
                    .from('companies')
                    .select('id, name')
                    .in('id', entityIds);
                for (const row of data || []) {
                    nameMap.set(row.id, { display_name: row.name || 'Company' });
                }
            } else if (entityType === 'firm') {
                const { data } = await this.supabase
                    .from('firms')
                    .select('id, name')
                    .in('id', entityIds);
                for (const row of data || []) {
                    nameMap.set(row.id, { display_name: row.name || 'Firm' });
                }
            }
        } catch (err) {
            this.logger.warn({ err, entityType }, 'Failed to enrich leaderboard entries');
        }

        return entries.map(entry => {
            const info = nameMap.get(entry.entity_id);
            return {
                ...entry,
                display_name: info?.display_name,
                avatar_url: info?.avatar_url,
            };
        });
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
