/**
 * V2 Repository - Identity Service
 * Direct Supabase queries for users, organizations, and memberships
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
    UserFilters,
    OrganizationFilters,
    MembershipFilters,
    InvitationFilters,
} from '../types';

export class RepositoryV2 {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    // ============================================
    // USERS
    // ============================================

    async findUsers(
        filters: UserFilters & { page: number; limit: number }
    ): Promise<{ data: any[]; total: number }> {
        let query = this.supabase.schema('identity').from('users').select('*', { count: 'exact' });

        if (filters.search) {
            query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);
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

    // ============================================
    // ORGANIZATIONS
    // ============================================

    async findOrganizations(
        filters: OrganizationFilters & { page: number; limit: number }
    ): Promise<{ data: any[]; total: number }> {
        let query = this.supabase
            .schema('identity')
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
            .schema('identity')
            .from('organizations')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    async createOrganization(data: any): Promise<any> {
        const { data: org, error } = await this.supabase
            .schema('identity')
            .from('organizations')
            .insert([data])
            .select()
            .single();

        if (error) throw error;
        return org;
    }

    async updateOrganization(id: string, updates: any): Promise<any> {
        const { data, error } = await this.supabase
            .schema('identity')
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
            .schema('identity')
            .from('organizations')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }

    // ============================================
    // MEMBERSHIPS
    // ============================================

    async findMemberships(
        filters: MembershipFilters & { page: number; limit: number }
    ): Promise<{ data: any[]; total: number }> {
        let query = this.supabase
            .schema('identity')
            .from('memberships')
            .select('*, organizations(*), users(*)', { count: 'exact' });

        if (filters.organization_id) {
            query = query.eq('organization_id', filters.organization_id);
        }

        if (filters.user_id) {
            query = query.eq('user_id', filters.user_id);
        }

        if (filters.role) {
            query = query.eq('role', filters.role);
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

    async findMembershipById(id: string): Promise<any> {
        const { data, error } = await this.supabase
            .schema('identity')
            .from('memberships')
            .select('*, organizations(*), users(*)')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    async createMembership(data: any): Promise<any> {
        const { data: membership, error } = await this.supabase
            .schema('identity')
            .from('memberships')
            .insert([data])
            .select('*, organizations(*), users(*)')
            .single();

        if (error) throw error;
        return membership;
    }

    async updateMembership(id: string, updates: any): Promise<any> {
        const { data, error } = await this.supabase
            .schema('identity')
            .from('memberships')
            .update(updates)
            .eq('id', id)
            .select('*, organizations(*), users(*)')
            .single();

        if (error) throw error;
        return data;
    }

    async deleteMembership(id: string): Promise<void> {
        const { error } = await this.supabase
            .schema('identity')
            .from('memberships')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }

    // ============================================
    // INVITATIONS
    // ============================================

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
