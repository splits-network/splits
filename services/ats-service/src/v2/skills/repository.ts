import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class SkillRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    getSupabase(): SupabaseClient {
        return this.supabase;
    }

    async search(query: string, limit: number = 10) {
        if (!query || query.trim().length < 1) {
            return [];
        }

        const { data, error } = await this.supabase
            .from('skills')
            .select('*')
            .ilike('name', `%${query.trim()}%`)
            .order('name')
            .limit(limit);

        if (error) throw error;
        return data || [];
    }

    async getById(id: string) {
        const { data, error } = await this.supabase
            .from('skills')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error('Skill not found');
        return data;
    }

    async getBySlug(slug: string) {
        const { data, error } = await this.supabase
            .from('skills')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async create(name: string, slug: string, createdBy?: string) {
        const payload: any = { name, slug };
        if (createdBy) payload.created_by = createdBy;

        const { data, error } = await this.supabase
            .from('skills')
            .insert(payload)
            .select('*')
            .single();

        if (error) throw error;
        return data;
    }

    async list(page: number = 1, limit: number = 50) {
        const offset = (page - 1) * limit;

        const { data, error, count } = await this.supabase
            .from('skills')
            .select('*', { count: 'exact' })
            .order('name')
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return { data: data || [], total: count || 0 };
    }
}
