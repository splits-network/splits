import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LeaderboardEntry, LeaderboardFilters } from './types';
import { BadgeEntityType } from '../badges/definitions/types';

export class LeaderboardRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, { db: { schema: 'public' } });
    }

    async getLeaderboard(filters: LeaderboardFilters): Promise<{ data: LeaderboardEntry[]; total: number }> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('leaderboard_entries')
            .select('*', { count: 'exact' })
            .eq('entity_type', filters.entity_type)
            .eq('period', filters.period)
            .eq('metric', filters.metric);

        if (filters.period_start) {
            query = query.eq('period_start', filters.period_start);
        } else {
            // Get latest period
            query = query.order('period_start', { ascending: false });
        }

        query = query.order('rank', { ascending: true });
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;
        if (error) throw error;
        return { data: data || [], total: count || 0 };
    }

    async getEntityRank(
        entityType: BadgeEntityType,
        entityId: string,
        period: string,
        metric: string
    ): Promise<LeaderboardEntry | null> {
        const { data, error } = await this.supabase
            .from('leaderboard_entries')
            .select('*')
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .eq('period', period)
            .eq('metric', metric)
            .order('period_start', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async upsertEntries(entries: Omit<LeaderboardEntry, 'id' | 'computed_at'>[]): Promise<void> {
        if (entries.length === 0) return;

        const { error } = await this.supabase
            .from('leaderboard_entries')
            .upsert(
                entries.map(e => ({ ...e, computed_at: new Date().toISOString() })),
                { onConflict: 'entity_type,entity_id,period,period_start,metric' }
            );

        if (error) throw error;
    }
}
