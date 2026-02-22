import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IntegrationProvider } from '@splits-network/shared-types';

export class ProviderRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async listActive(): Promise<IntegrationProvider[]> {
        const { data, error } = await this.supabase
            .from('integration_providers')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return data ?? [];
    }

    async findBySlug(slug: string): Promise<IntegrationProvider | null> {
        const { data, error } = await this.supabase
            .from('integration_providers')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }
}
