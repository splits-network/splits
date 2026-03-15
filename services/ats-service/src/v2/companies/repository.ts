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
            // Normalize special chars to match indexing, then AND-join for tsquery
            const tsquery = filters.search.replace(/[@+._\-\/:]/g, ' ').trim().split(/\s+/).filter(t => t).join(' & ');
            query = query.textSearch('search_vector', tsquery, {
                type: 'websearch',
                config: 'english'
            });
        }

        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        if (filters.industry) {
            query = query.eq('industry', filters.industry);
        }

        if (filters.company_size) {
            query = query.eq('company_size', filters.company_size);
        }

        if (filters.stage) {
            query = query.eq('stage', filters.stage);
        }

        // Founded year range buckets
        if (filters.founded_year_range) {
            switch (filters.founded_year_range) {
                case 'pre_2000': query = query.lt('founded_year', 2000); break;
                case '2000_2010': query = query.gte('founded_year', 2000).lt('founded_year', 2010); break;
                case '2010_2020': query = query.gte('founded_year', 2010).lt('founded_year', 2020); break;
                case '2020_plus': query = query.gte('founded_year', 2020); break;
            }
        }

        // Has open roles — subquery on jobs table
        if (filters.has_open_roles) {
            const { data: activeJobCompanies } = await this.supabase
                .from('jobs')
                .select('company_id')
                .eq('status', 'active');
            const companyIdsWithJobs = [...new Set((activeJobCompanies || []).map((j: any) => j.company_id))];
            if (filters.has_open_roles === 'yes') {
                if (companyIdsWithJobs.length > 0) {
                    query = query.in('id', companyIdsWithJobs);
                } else {
                    return { data: [], total: 0 };
                }
            } else if (filters.has_open_roles === 'no') {
                if (companyIdsWithJobs.length > 0) {
                    query = query.not('id', 'in', `(${companyIdsWithJobs.join(',')})`);
                }
            }
        }

        // Apply sorting
        const sortBy = filters.sort_by || 'name';
        const sortOrder = filters.sort_order?.toLowerCase() === 'asc' ? true : false;
        query = query.order(sortBy, { ascending: sortOrder });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        const companyIds = (data || []).map((c: any) => c.id);

        if (companyIds.length === 0) {
            return { data: [], total: 0 };
        }

        const { data: jobRows } = await this.supabase
            .from('jobs')
            .select('company_id, status, salary_min, salary_max')
            .in('company_id', companyIds);

        const statsMap: Record<string, { open_roles_count: number; salary_sum: number; salary_count: number }> = {};
        for (const job of (jobRows || [])) {
            if (!statsMap[job.company_id]) {
                statsMap[job.company_id] = { open_roles_count: 0, salary_sum: 0, salary_count: 0 };
            }
            if (job.status === 'active') {
                statsMap[job.company_id].open_roles_count += 1;
                if (job.salary_min != null && job.salary_max != null) {
                    statsMap[job.company_id].salary_sum += (job.salary_min + job.salary_max) / 2;
                    statsMap[job.company_id].salary_count += 1;
                }
            }
        }

        const enrichedData = (data || []).map((c: any) => ({
            ...c,
            open_roles_count: statsMap[c.id]?.open_roles_count ?? 0,
            avg_salary: statsMap[c.id]?.salary_count > 0
                ? Math.round(statsMap[c.id].salary_sum / statsMap[c.id].salary_count)
                : null,
        }));

        return {
            data: enrichedData,
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

        const { data: jobRows } = await this.supabase
            .from('jobs')
            .select('status, salary_min, salary_max')
            .eq('company_id', id);

        const activeJobs = (jobRows || []).filter((j: any) => j.status === 'active');
        const salaryJobs = activeJobs.filter((j: any) => j.salary_min != null && j.salary_max != null);
        data.open_roles_count = activeJobs.length;
        data.avg_salary = salaryJobs.length > 0
            ? Math.round(salaryJobs.reduce((sum: number, j: any) => sum + (j.salary_min + j.salary_max) / 2, 0) / salaryJobs.length)
            : null;

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
