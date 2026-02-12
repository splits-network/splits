/**
 * Company Repository
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CompanyFilters, CompanyUpdate } from './types';
import { resolveAccessContext } from '../shared/access';

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}

export class CompanyRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    getSupabase(): SupabaseClient {
        return this.supabase;
    }

    async findCompanies(
        clerkUserId: string,
        filters: CompanyFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;
        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
        const organizationIds = accessContext.organizationIds;
        const isBrowseAll = filters.browse_all === 'true';

        // For marketplace browse, skip org-based restrictions so all authenticated users can see all companies
        if (!isBrowseAll && !accessContext.isPlatformAdmin && organizationIds.length === 0) {
            return { data: [], total: 0 };
        }

        // Build query
        let query = this.supabase

            .from('companies')
            .select('*', { count: 'exact' });

        // Apply organization filter (skip when browsing marketplace)
        if (!isBrowseAll && !accessContext.isPlatformAdmin && organizationIds.length > 0) {
            query = query.in('identity_organization_id', organizationIds);
        }

        const requestedOrgId =
            filters.identity_organization_id || filters.organization_id || filters.org_id;
        if (requestedOrgId) {
            query = query.eq('identity_organization_id', requestedOrgId);
        }

        // Apply full-text search across all company fields
        if (filters.search) {
            // Multi-word search: split and join with ' & ' for AND logic
            const tsquery = filters.search.split(/\s+/).filter(t => t.trim()).join(' & ');
            query = query.textSearch('search_vector', tsquery, {
                type: 'websearch',
                config: 'english'
            });
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

            .from('companies')
            .insert(company)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateCompany(id: string, updates: CompanyUpdate): Promise<any> {
        const { data, error } = await this.supabase

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

            .from('companies')
            .update({ status: 'inactive', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }

    async findCompanyContacts(companyId: string): Promise<any[]> {
        // Look up the company's identity_organization_id
        const company = await this.findCompany(companyId);
        if (!company || !company.identity_organization_id) {
            return [];
        }

        // Query memberships + users for hiring managers and company admins
        const { data, error } = await this.supabase
            .from('memberships')
            .select('id, role_name, user_id, users(id, name, email, profile_image_url)')
            .eq('organization_id', company.identity_organization_id)
            .in('role_name', ['hiring_manager', 'company_admin'])
            .is('deleted_at', null);

        if (error) throw error;

        return (data || []).map((userRole: any) => ({
            id: userRole.id,
            role: userRole.role_name,
            user_id: userRole.user_id,
            name: userRole.users?.name || null,
            email: userRole.users?.email || null,
            profile_image_url: userRole.users?.profile_image_url || null,
        }));
    }
}
