import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BadgeEntityType } from '../badges/definitions/types.js';
import { EntityLevel, LevelThreshold, XpHistoryFilters, XpLedgerEntry, XpRule, XpSourceType } from './types.js';

export class XpRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, { db: { schema: 'public' } });
    }

    // -- XP Ledger --

    async addEntry(entry: {
        entity_type: BadgeEntityType;
        entity_id: string;
        source: XpSourceType;
        points: number;
        reference_id?: string;
        description?: string;
    }): Promise<XpLedgerEntry> {
        const { data, error } = await this.supabase
            .from('xp_ledger')
            .insert(entry)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getHistory(filters: XpHistoryFilters): Promise<{ data: XpLedgerEntry[]; total: number }> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('xp_ledger')
            .select('*', { count: 'exact' })
            .eq('entity_type', filters.entity_type)
            .eq('entity_id', filters.entity_id);

        if (filters.source) query = query.eq('source', filters.source);
        query = query.order('created_at', { ascending: false });
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;
        if (error) throw error;
        return { data: data || [], total: count || 0 };
    }

    async getTodayPoints(entityType: BadgeEntityType, entityId: string, source: XpSourceType): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data, error } = await this.supabase
            .from('xp_ledger')
            .select('points')
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .eq('source', source)
            .gte('created_at', today.toISOString());

        if (error) throw error;
        return (data || []).reduce((sum, row) => sum + row.points, 0);
    }

    // -- Entity Levels --

    async getLevel(entityType: BadgeEntityType, entityId: string): Promise<EntityLevel | null> {
        const { data, error } = await this.supabase
            .from('entity_levels')
            .select('*')
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async getLevelsByEntityIds(
        entityType: BadgeEntityType,
        entityIds: string[]
    ): Promise<EntityLevel[]> {
        if (entityIds.length === 0) return [];
        const { data, error } = await this.supabase
            .from('entity_levels')
            .select('*')
            .eq('entity_type', entityType)
            .in('entity_id', entityIds);

        if (error) throw error;
        return data || [];
    }

    async upsertLevel(level: Omit<EntityLevel, 'updated_at'>): Promise<EntityLevel> {
        const { data, error } = await this.supabase
            .from('entity_levels')
            .upsert(level, { onConflict: 'entity_type,entity_id' })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // -- Level Thresholds --

    async getAllThresholds(): Promise<LevelThreshold[]> {
        const { data, error } = await this.supabase
            .from('level_thresholds')
            .select('*')
            .order('level', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    // -- XP Rules --

    async getRule(source: XpSourceType, entityType: BadgeEntityType): Promise<XpRule | null> {
        const { data, error } = await this.supabase
            .from('xp_rules')
            .select('*')
            .eq('source', source)
            .eq('entity_type', entityType)
            .eq('active', true)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async getAllRules(): Promise<XpRule[]> {
        const { data, error } = await this.supabase
            .from('xp_rules')
            .select('*')
            .order('entity_type', { ascending: true });

        if (error) throw error;
        return data || [];
    }
}
