import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContext, resolveAccessContext } from '@splits-network/shared-access-context';
import { CompanySourcer, CompanySourcerCreate, CompanySourcerFilters, CompanySourcerUpdate } from './types';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';

export class CompanySourcerRepository {
    constructor(private supabase: SupabaseClient) { }

    async list(
        clerkUserId: string,
        params: StandardListParams & CompanySourcerFilters
    ): Promise<StandardListResponse<CompanySourcer>> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);
        const { page = 1, limit = 25, search, filters = {}, sort_by = 'sourced_at', sort_order = 'desc' } = params;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('company_sourcers')
            .select('*', { count: 'exact' });

        // Role-based filtering
        if (context.recruiterId) {
            // Recruiters see only companies they sourced
            query = query.eq('sourcer_recruiter_id', context.recruiterId);
        } else if (context.organizationIds.length > 0 && !context.isPlatformAdmin) {
            // Company users see sourcers for their own companies
            query = query.in('company_id', context.organizationIds);
        }
        // Platform admins see everything (no filter)

        // Apply filters
        if (filters.company_id) {
            query = query.eq('company_id', filters.company_id);
        }
        if (filters.sourcer_recruiter_id) {
            query = query.eq('sourcer_recruiter_id', filters.sourcer_recruiter_id);
        }
        if (filters.sourcer_type) {
            query = query.eq('sourcer_type', filters.sourcer_type);
        }
        if (filters.active_protection) {
            query = query.gt('protection_expires_at', new Date().toISOString());
        }

        // Apply search
        if (search) {
            query = query.ilike('notes', `%${search}%`);
        }

        // Apply sorting
        query = query.order(sort_by, { ascending: sort_order === 'asc' });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
            throw new Error(`Failed to list company sourcers: ${error.message}`);
        }

        return {
            data: data || [],
            pagination: {
                total: count || 0,
                page,
                limit,
                total_pages: Math.ceil((count || 0) / limit),
            },
        };
    }

    async findById(id: string, clerkUserId: string): Promise<CompanySourcer | null> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        let query = this.supabase
            .from('company_sourcers')
            .select('*')
            .eq('id', id)
            .single();

        const { data, error } = await query;

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to find company sourcer: ${error.message}`);
        }

        // Apply role-based access check
        if (context.recruiterId && data.sourcer_recruiter_id !== context.recruiterId) {
            return null; // Recruiter can only see their own sourcing
        } else if (context.organizationIds.length > 0 && !context.isPlatformAdmin) {
            // Check if company is accessible
            if (!context.organizationIds.includes(data.company_id)) {
                return null;
            }
        }

        return data;
    }

    async findByCompany(company_id: string): Promise<CompanySourcer | null> {
        const { data, error } = await this.supabase
            .from('company_sourcers')
            .select('*')
            .eq('company_id', company_id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to find company sourcer: ${error.message}`);
        }

        return data;
    }

    async create(sourcerData: CompanySourcerCreate): Promise<CompanySourcer> {
        const { data, error } = await this.supabase
            .from('company_sourcers')
            .insert({
                company_id: sourcerData.company_id,
                sourcer_recruiter_id: sourcerData.sourcer_recruiter_id,
                sourcer_type: sourcerData.sourcer_type,
                sourced_at: sourcerData.sourced_at || new Date().toISOString(),
                protection_window_days: sourcerData.protection_window_days || 365,
                protection_expires_at: sourcerData.protection_expires_at.toISOString(),
                notes: sourcerData.notes,
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create company sourcer: ${error.message}`);
        }

        return data;
    }

    async update(id: string, clerkUserId: string, updates: CompanySourcerUpdate): Promise<CompanySourcer> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Build update query with role-based filtering
        let query = this.supabase
            .from('company_sourcers')
            .update({
                notes: updates.notes,
                protection_window_days: updates.protection_window_days,
                protection_expires_at: updates.protection_expires_at?.toISOString(),
            })
            .eq('id', id);

        // Apply role-based access control
        if (context.recruiterId) {
            query = query.eq('sourcer_recruiter_id', context.recruiterId);
        } else if (context.organizationIds.length > 0 && !context.isPlatformAdmin) {
            // Need to verify company is accessible
            const existing = await this.findById(id, clerkUserId);
            if (!existing) {
                throw new Error('Company sourcer not found or access denied');
            }
        }

        const { data, error } = await query.select().single();

        if (error) {
            throw new Error(`Failed to update company sourcer: ${error.message}`);
        }

        return data;
    }

    async delete(id: string, clerkUserId: string): Promise<void> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        // Only platform admins can delete sourcer records
        if (!context.isPlatformAdmin) {
            throw new Error('Only platform administrators can delete sourcer records');
        }

        const { error } = await this.supabase
            .from('company_sourcers')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Failed to delete company sourcer: ${error.message}`);
        }
    }

    async checkProtectionStatus(company_id: string): Promise<{
        has_protection: boolean;
        sourcer_recruiter_id?: string;
        sourced_at?: Date;
    }> {
        const sourcer = await this.findByCompany(company_id);

        if (!sourcer) {
            return { has_protection: false };
        }

        // Permanent attribution - always protected if sourcer exists
        return {
            has_protection: true,
            sourcer_recruiter_id: sourcer.sourcer_recruiter_id,
            sourced_at: new Date(sourcer.sourced_at),
        };
    }

    /**
     * Get sourcer by company ID (alias for findByCompany for clarity)
     */
    async getByCompanyId(company_id: string): Promise<CompanySourcer | null> {
        return this.findByCompany(company_id);
    }

    /**
     * Check if company has an active sourcer (sourcer exists and recruiter account is active)
     */
    async isSourcerActive(company_id: string): Promise<boolean> {
        const sourcer = await this.findByCompany(company_id);
        if (!sourcer) return false;

        // Check if sourcer's recruiter account is active
        const { data: recruiter, error } = await this.supabase
            .from('recruiters')
            .select('status')
            .eq('id', sourcer.sourcer_recruiter_id)
            .single();

        if (error || !recruiter) return false;

        return recruiter.status === 'active';
    }
}
