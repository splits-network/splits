import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EntityStreak } from './types';
import { BadgeEntityType } from '../badges/definitions/types';

export class StreakRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, { db: { schema: 'public' } });
    }

    async getByEntity(entityType: BadgeEntityType, entityId: string): Promise<EntityStreak[]> {
        const { data, error } = await this.supabase
            .from('entity_streaks')
            .select('*')
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .order('streak_type', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    async getStreak(
        entityType: BadgeEntityType,
        entityId: string,
        streakType: string
    ): Promise<EntityStreak | null> {
        const { data, error } = await this.supabase
            .from('entity_streaks')
            .select('*')
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .eq('streak_type', streakType)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async upsert(streak: Omit<EntityStreak, 'id' | 'updated_at'>): Promise<EntityStreak> {
        const { data, error } = await this.supabase
            .from('entity_streaks')
            .upsert({
                entity_type: streak.entity_type,
                entity_id: streak.entity_id,
                streak_type: streak.streak_type,
                current_count: streak.current_count,
                longest_count: streak.longest_count,
                last_activity_at: streak.last_activity_at,
                streak_started_at: streak.streak_started_at,
            }, { onConflict: 'entity_type,entity_id,streak_type' })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
