import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { OrganizationFilters } from './types';

export class OrganizationRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    async findOrganizations(
        filters: OrganizationFilters & { page: number; limit: number }
    ): Promise<{ data: any[]; total: number }> {
        let query = this.supabase
            .from('organizations')
            .select('*', { count: 'exact' });

        if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`);
        }

        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        const { data, count, error } = await query
            .order('created_at', { ascending: false })
            .range((filters.page - 1) * filters.limit, filters.page * filters.limit - 1);

        if (error) throw error;
        return { data: data || [], total: count || 0 };
    }

    async findOrganizationById(id: string): Promise<any> {
        const { data, error } = await this.supabase
            .from('organizations')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    async createOrganization(data: any): Promise<any> {
        const { data: org, error } = await this.supabase
            .from('organizations')
            .insert([data])
            .select()
            .single();

        if (error) throw error;
        return org;
    }

    async updateOrganization(id: string, updates: any): Promise<any> {
        const { data, error } = await this.supabase
            .from('organizations')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteOrganization(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('organizations')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }
}
