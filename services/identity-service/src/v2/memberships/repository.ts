import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MembershipFilters } from './types';

export class MembershipRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    async findMemberships(
        filters: MembershipFilters & { page: number; limit: number }
    ): Promise<{ data: any[]; total: number }> {
        let query = this.supabase
            .from('memberships')
            .select('*, users(*), organizations(*), companies(*), roles!memberships_role_name_fkey(*)', { count: 'exact' })
            .is('deleted_at', null);

        if (filters.user_id) {
            query = query.eq('user_id', filters.user_id);
        }

        if (filters.role_name) {
            query = query.eq('role_name', filters.role_name);
        }

        if (filters.organization_id) {
            query = query.eq('organization_id', filters.organization_id);
        }

        if (filters.company_id !== undefined) {
            if (filters.company_id === null) {
                query = query.is('company_id', null);
            } else {
                query = query.eq('company_id', filters.company_id);
            }
        }

        const { data, count, error } = await query
            .order('created_at', { ascending: false })
            .range((filters.page - 1) * filters.limit, filters.page * filters.limit - 1);

        if (error) throw error;
        return { data: data || [], total: count || 0 };
    }

    async findMembershipById(id: string): Promise<any> {
        const { data, error } = await this.supabase
            .from('memberships')
            .select('*, users(*), organizations(*), companies(*), roles!memberships_role_name_fkey(*)')
            .eq('id', id)
            .is('deleted_at', null)
            .single();

        if (error) throw error;
        return data;
    }

    async createMembership(data: any): Promise<any> {
        const { data: membership, error } = await this.supabase
            .from('memberships')
            .insert([data])
            .select('*, users(*), organizations(*), companies(*), roles!memberships_role_name_fkey(*)')
            .single();

        if (error) throw error;
        return membership;
    }

    async updateMembership(id: string, updates: any): Promise<any> {
        const { data, error } = await this.supabase
            .from('memberships')
            .update(updates)
            .eq('id', id)
            .select('*, users(*), organizations(*), companies(*), roles!memberships_role_name_fkey(*)')
            .single();

        if (error) throw error;
        return data;
    }

    async deleteMembership(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('memberships')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }
}
