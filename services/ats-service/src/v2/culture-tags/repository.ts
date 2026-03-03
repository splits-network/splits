import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class CultureTagRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    getSupabase(): SupabaseClient {
        return this.supabase;
    }

    async search(query: string, limit: number = 20) {
        if (!query || query.trim().length < 1) {
            return [];
        }

        const { data, error } = await this.supabase
            .from('culture_tags')
            .select('*')
            .ilike('name', `%${query.trim()}%`)
            .order('name')
            .limit(limit);

        if (error) throw error;
        return data || [];
    }

    async getById(id: string) {
        const { data, error } = await this.supabase
            .from('culture_tags')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error('Culture tag not found');
        return data;
    }

    async getBySlug(slug: string) {
        const { data, error } = await this.supabase
            .from('culture_tags')
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
            .from('culture_tags')
            .insert(payload)
            .select('*')
            .single();

        if (error) throw error;
        return data;
    }
}
