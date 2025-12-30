import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { InvitationFilters } from './types';

export class InvitationRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async findInvitations(
        filters: InvitationFilters & { page: number; limit: number }
    ): Promise<{ data: any[]; total: number }> {
        let query = this.supabase
            .schema('identity')
            .from('invitations')
            .select('*, organizations(*)', { count: 'exact' });

        if (filters.organization_id) {
            query = query.eq('organization_id', filters.organization_id);
        }

        if (filters.email) {
            query = query.eq('email', filters.email);
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

    async findInvitationById(id: string): Promise<any> {
        const { data, error } = await this.supabase
            .schema('identity')
            .from('invitations')
            .select('*, organizations(*)')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    async createInvitation(data: any): Promise<any> {
        const { data: invitation, error } = await this.supabase
            .schema('identity')
            .from('invitations')
            .insert([data])
            .select('*, organizations(*)')
            .single();

        if (error) throw error;
        return invitation;
    }

    async updateInvitation(id: string, updates: any): Promise<any> {
        const { data, error } = await this.supabase
            .schema('identity')
            .from('invitations')
            .update(updates)
            .eq('id', id)
            .select('*, organizations(*)')
            .single();

        if (error) throw error;
        return data;
    }

    async deleteInvitation(id: string): Promise<void> {
        const { error } = await this.supabase
            .schema('identity')
            .from('invitations')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }
}
