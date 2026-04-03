import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BadgeAwarded, BadgeAwardedWithDefinition, BadgeAwardFilters } from './types.js';
import { BadgeEntityType } from '../definitions/types.js';

export class BadgeAwardRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, { db: { schema: 'public' } });
    }

    async findByEntity(
        entityType: BadgeEntityType,
        entityId: string,
        includeRevoked = false
    ): Promise<BadgeAwardedWithDefinition[]> {
        let query = this.supabase
            .from('badges_awarded')
            .select(`
                *,
                badge_definition:badge_definitions(slug, name, description, icon, color, tier)
            `)
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .order('awarded_at', { ascending: false });

        if (!includeRevoked) {
            query = query.is('revoked_at', null);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    async findByEntityIds(
        entityType: BadgeEntityType,
        entityIds: string[]
    ): Promise<BadgeAwardedWithDefinition[]> {
        if (entityIds.length === 0) return [];
        const { data, error } = await this.supabase
            .from('badges_awarded')
            .select(`
                *,
                badge_definition:badge_definitions(slug, name, description, icon, color, tier)
            `)
            .eq('entity_type', entityType)
            .in('entity_id', entityIds)
            .is('revoked_at', null)
            .order('awarded_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async findAll(filters: BadgeAwardFilters): Promise<{ data: BadgeAwardedWithDefinition[]; total: number }> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('badges_awarded')
            .select(`
                *,
                badge_definition:badge_definitions(slug, name, description, icon, color, tier)
            `, { count: 'exact' });

        if (filters.entity_type) query = query.eq('entity_type', filters.entity_type);
        if (filters.entity_id) query = query.eq('entity_id', filters.entity_id);
        if (!filters.include_revoked) query = query.is('revoked_at', null);

        query = query.order('awarded_at', { ascending: false });
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;
        if (error) throw error;
        return { data: data || [], total: count || 0 };
    }

    async findExisting(
        badgeDefinitionId: string,
        entityType: BadgeEntityType,
        entityId: string
    ): Promise<BadgeAwarded | null> {
        const { data, error } = await this.supabase
            .from('badges_awarded')
            .select('*')
            .eq('badge_definition_id', badgeDefinitionId)
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async award(
        badgeDefinitionId: string,
        entityType: BadgeEntityType,
        entityId: string,
        metadata: Record<string, any> = {}
    ): Promise<BadgeAwarded> {
        const { data, error } = await this.supabase
            .from('badges_awarded')
            .upsert({
                badge_definition_id: badgeDefinitionId,
                entity_type: entityType,
                entity_id: entityId,
                metadata,
                revoked_at: null,
                awarded_at: new Date().toISOString(),
            }, { onConflict: 'badge_definition_id,entity_type,entity_id' })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async revoke(
        badgeDefinitionId: string,
        entityType: BadgeEntityType,
        entityId: string
    ): Promise<void> {
        const { error } = await this.supabase
            .from('badges_awarded')
            .update({ revoked_at: new Date().toISOString() })
            .eq('badge_definition_id', badgeDefinitionId)
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .is('revoked_at', null);

        if (error) throw error;
    }
}
