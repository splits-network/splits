import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserFilters } from './types';

export class UserRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async findUsers(
        filters: UserFilters & { page: number; limit: number },
        options: { accessibleUserIds?: string[] } = {}
    ): Promise<{ data: any[]; total: number }> {
        const accessibleUserIds = options.accessibleUserIds;

        if (accessibleUserIds && accessibleUserIds.length === 0) {
            return { data: [], total: 0 };
        }

        let query = this.supabase.schema('identity').from('users').select('*', { count: 'exact' });

        if (filters.search) {
            query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);
        }

        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        if (accessibleUserIds && accessibleUserIds.length > 0) {
            if (accessibleUserIds.length === 1) {
                query = query.eq('id', accessibleUserIds[0]);
            } else {
                query = query.in('id', accessibleUserIds);
            }
        }

        const { data, count, error } = await query
            .order('created_at', { ascending: false })
            .range((filters.page - 1) * filters.limit, filters.page * filters.limit - 1);

        if (error) throw error;
        return { data: data || [], total: count || 0 };
    }

    async findUserById(id: string): Promise<any> {
        const { data, error } = await this.supabase
            .schema('identity')
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    async createUser(data: any): Promise<any> {
        const { data: user, error } = await this.supabase
            .schema('identity')
            .from('users')
            .insert([data])
            .select()
            .single();

        if (error) throw error;
        return user;
    }

    async updateUser(id: string, updates: any): Promise<any> {
        const { data, error } = await this.supabase
            .schema('identity')
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteUser(id: string): Promise<void> {
        const { error } = await this.supabase
            .schema('identity')
            .from('users')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }
}
