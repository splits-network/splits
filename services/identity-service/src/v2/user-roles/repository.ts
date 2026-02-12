import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserRoleFilters } from './types';

export class UserRoleRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    async findUserRoles(
        filters: UserRoleFilters & { page: number; limit: number }
    ): Promise<{ data: any[]; total: number }> {
        let query = this.supabase
            .from('user_roles')
            .select('*, users(*), roles!user_roles_role_name_fkey(*)', { count: 'exact' })
            .is('deleted_at', null);

        if (filters.user_id) {
            query = query.eq('user_id', filters.user_id);
        }

        if (filters.role_name) {
            query = query.eq('role_name', filters.role_name);
        }

        const { data, count, error } = await query
            .order('created_at', { ascending: false })
            .range((filters.page - 1) * filters.limit, filters.page * filters.limit - 1);

        if (error) throw error;
        return { data: data || [], total: count || 0 };
    }

    async findUserRoleById(id: string): Promise<any> {
        const { data, error } = await this.supabase
            .from('user_roles')
            .select('*, users(*), roles!user_roles_role_name_fkey(*)')
            .eq('id', id)
            .is('deleted_at', null)
            .single();

        if (error) throw error;
        return data;
    }

    async findUserRolesByUserId(userId: string): Promise<any[]> {
        const { data, error } = await this.supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async createUserRole(data: any): Promise<any> {
        const { data: userRole, error } = await this.supabase
            .from('user_roles')
            .insert([data])
            .select('*, users(*), roles!user_roles_role_name_fkey(*)')
            .single();

        if (error) throw error;
        return userRole;
    }

    async updateUserRole(id: string, updates: any): Promise<any> {
        const { data, error } = await this.supabase
            .from('user_roles')
            .update(updates)
            .eq('id', id)
            .select('*, users(*), roles!user_roles_role_name_fkey(*)')
            .single();

        if (error) throw error;
        return data;
    }

    async deleteUserRole(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('user_roles')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }
}
