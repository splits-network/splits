import { BadgeEntityType } from '../badges/definitions/types.js';

export type LeaderboardPeriod = 'weekly' | 'monthly' | 'quarterly' | 'all_time';

export interface LeaderboardEntry {
    id: string;
    entity_type: BadgeEntityType;
    entity_id: string;
    period: LeaderboardPeriod;
    period_start: string;
    rank: number;
    score: number;
    metric: string;
    metadata: Record<string, any>;
    computed_at: string;
    display_name?: string;
    avatar_url?: string;
}

export interface LeaderboardFilters {
    entity_type: BadgeEntityType;
    period: LeaderboardPeriod;
    metric: string;
    period_start?: string;
    page?: number;
    limit?: number;
}
