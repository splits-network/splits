import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BadgeProgress, BadgeProgressWithDefinition } from './types.js';
import { BadgeEntityType } from '../definitions/types.js';

export class BadgeProgressRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, { db: { schema: 'public' } });
    }

    async findByEntity(
        entityType: BadgeEntityType,
        entityId: string
    ): Promise<BadgeProgressWithDefinition[]> {
        const { data, error } = await this.supabase
            .from('badge_progress')
            .select(`
                *,
                badge_definition:badge_definitions(slug, name, description, icon, color, tier)
            `)
            .eq('entity_type', entityType)
            .eq('entity_id', entityId)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async upsert(
        badgeDefinitionId: string,
        entityType: BadgeEntityType,
        entityId: string,
        currentValue: number,
        targetValue: number
    ): Promise<BadgeProgress> {
        const { data, error } = await this.supabase
            .from('badge_progress')
            .upsert({
                badge_definition_id: badgeDefinitionId,
                entity_type: entityType,
                entity_id: entityId,
                current_value: currentValue,
                target_value: targetValue,
            }, { onConflict: 'badge_definition_id,entity_type,entity_id' })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteByBadge(
        badgeDefinitionId: string,
        entityType: BadgeEntityType,
        entityId: string
    ): Promise<void> {
        const { error } = await this.supabase
            .from('badge_progress')
            .delete()
            .eq('badge_definition_id', badgeDefinitionId)
            .eq('entity_type', entityType)
            .eq('entity_id', entityId);

        if (error) throw error;
    }
}
