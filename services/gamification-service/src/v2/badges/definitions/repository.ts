import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BadgeDefinition, BadgeDefinitionCreate, BadgeDefinitionUpdate, BadgeDefinitionFilters } from './types.js';

export class BadgeDefinitionRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, { db: { schema: 'public' } });
    }

    async findAll(filters: BadgeDefinitionFilters = {}): Promise<{ data: BadgeDefinition[]; total: number }> {
        const page = filters.page || 1;
        const limit = filters.limit || 50;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('badge_definitions')
            .select('*', { count: 'exact' });

        if (filters.entity_type) query = query.eq('entity_type', filters.entity_type);
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.tier) query = query.eq('tier', filters.tier);

        query = query.order('display_order', { ascending: true });
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;
        if (error) throw error;
        return { data: data || [], total: count || 0 };
    }

    async findBySlug(slug: string): Promise<BadgeDefinition | null> {
        const { data, error } = await this.supabase
            .from('badge_definitions')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async findById(id: string): Promise<BadgeDefinition | null> {
        const { data, error } = await this.supabase
            .from('badge_definitions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async findActiveByTriggerEvent(eventType: string): Promise<BadgeDefinition[]> {
        const { data, error } = await this.supabase
            .from('badge_definitions')
            .select('*')
            .eq('status', 'active')
            .contains('trigger_events', [eventType]);

        if (error) throw error;
        return data || [];
    }

    async create(definition: BadgeDefinitionCreate): Promise<BadgeDefinition> {
        const { data, error } = await this.supabase
            .from('badge_definitions')
            .insert(definition)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id: string, updates: BadgeDefinitionUpdate): Promise<BadgeDefinition> {
        const { data, error } = await this.supabase
            .from('badge_definitions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('badge_definitions')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}
