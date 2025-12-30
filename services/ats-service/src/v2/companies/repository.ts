/**
 * Company Repository
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CompanyFilters, CompanyUpdate } from './types';

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}

export class CompanyRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async findCompanies(
        clerkUserId: string,
        filters: CompanyFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        // Get user's organization IDs
        const { data: memberships } = await this.supabase
            .schema('identity')
            .from('memberships')
            .select('organization_id')
            .eq('user_id', clerkUserId);

        const organizationIds = memberships?.map((m) => m.organization_id) || [];

        // Build query
        let query = this.supabase
            .schema('ats')
            .from('companies')
            .select('*', { count: 'exact' });

        // Apply organization filter
        if (organizationIds.length > 0) {
            query = query.in('identity_organization_id', organizationIds);
        }

        // Apply filters
        if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        // Apply sorting
        const sortBy = filters.sort_by || 'name';
        const sortOrder = filters.sort_order?.toLowerCase() === 'asc' ? true : false;
        query = query.order(sortBy, { ascending: sortOrder });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            data: data || [],
            total: count || 0,
        };
    }

    async findCompany(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('companies')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async createCompany(company: any): Promise<any> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('companies')
            .insert(company)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateCompany(id: string, updates: CompanyUpdate): Promise<any> {
        const { data, error } = await this.supabase
            .schema('ats')
            .from('companies')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteCompany(id: string): Promise<void> {
        // Soft delete
        const { error } = await this.supabase
            .schema('ats')
            .from('companies')
            .update({ status: 'inactive', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }
}
