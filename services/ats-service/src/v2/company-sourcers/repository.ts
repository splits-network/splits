import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContext, resolveAccessContext } from '@splits-network/shared-access-context';
import { RecruiterCompany, CompanySourcerCreate, CompanySourcerFilters, CompanySourcerUpdate } from './types';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';

export class CompanySourcerRepository {
    constructor(private supabase: SupabaseClient) { }

    async list(
        clerkUserId: string,
        params: StandardListParams & CompanySourcerFilters
    ): Promise<StandardListResponse<RecruiterCompany>> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);
        const { page = 1, limit = 25, search, filters = {}, sort_by = 'relationship_start_date', sort_order = 'desc' } = params;
        const offset = (page - 1) * limit;

        let query = this.supabase
            .from('recruiter_companies')
            .select('*', { count: 'exact' })
            .eq('relationship_type', 'sourcer');

        // Role-based filtering
        if (context.recruiterId) {
            // Recruiters see only companies they sourced
            query = query.eq('recruiter_id', context.recruiterId);
        } else if (context.organizationIds.length > 0 && !context.isPlatformAdmin) {
            // Company users see sourcers for their own companies
            query = query.in('company_id', context.organizationIds);
        }
        // Platform admins see everything (no filter)

        // Apply filters
        if (filters.company_id) {
            query = query.eq('company_id', filters.company_id);
        }
        if (filters.recruiter_id) {
            query = query.eq('recruiter_id', filters.recruiter_id);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        // Apply search
        if (search) {
            query = query.ilike('termination_reason', `%${search}%`);
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

    async findById(id: string, clerkUserId: string): Promise<RecruiterCompany | null> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        const { data, error } = await this.supabase
            .from('recruiter_companies')
            .select('*')
            .eq('id', id)
            .eq('relationship_type', 'sourcer')
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to find company sourcer: ${error.message}`);
        }

        // Apply role-based access check
        if (context.recruiterId && data.recruiter_id !== context.recruiterId) {
            return null; // Recruiter can only see their own sourcing
        } else if (context.organizationIds.length > 0 && !context.isPlatformAdmin) {
            if (!context.organizationIds.includes(data.company_id)) {
                return null;
            }
        }

        return data;
    }

    async findByCompany(company_id: string): Promise<RecruiterCompany | null> {
        const { data, error } = await this.supabase
            .from('recruiter_companies')
            .select('*')
            .eq('company_id', company_id)
            .eq('relationship_type', 'sourcer')
            .eq('status', 'active')
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to find company sourcer: ${error.message}`);
        }

        return data;
    }

    async create(sourcerData: CompanySourcerCreate): Promise<RecruiterCompany> {
        const { data, error } = await this.supabase
            .from('recruiter_companies')
            .insert({
                company_id: sourcerData.company_id,
                recruiter_id: sourcerData.recruiter_id,
                relationship_type: 'sourcer',
                status: 'active',
                relationship_start_date: sourcerData.relationship_start_date || new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create company sourcer: ${error.message}`);
        }

        return data;
    }

    async update(id: string, clerkUserId: string, updates: CompanySourcerUpdate): Promise<RecruiterCompany> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        let query = this.supabase
            .from('recruiter_companies')
            .update({
                ...(updates.status && { status: updates.status }),
                ...(updates.relationship_end_date && { relationship_end_date: updates.relationship_end_date }),
                ...(updates.termination_reason && { termination_reason: updates.termination_reason }),
            })
            .eq('id', id)
            .eq('relationship_type', 'sourcer');

        // Apply role-based access control
        if (context.recruiterId) {
            query = query.eq('recruiter_id', context.recruiterId);
        } else if (context.organizationIds.length > 0 && !context.isPlatformAdmin) {
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
            .from('recruiter_companies')
            .delete()
            .eq('id', id)
            .eq('relationship_type', 'sourcer');

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

        // Permanent attribution - always protected if active sourcer exists
        return {
            has_protection: true,
            sourcer_recruiter_id: sourcer.recruiter_id,
            sourced_at: new Date(sourcer.relationship_start_date),
        };
    }

    /**
     * Get sourcer by company ID (alias for findByCompany for clarity)
     */
    async getByCompanyId(company_id: string): Promise<RecruiterCompany | null> {
        return this.findByCompany(company_id);
    }

    /**
     * Check if company has an active sourcer (sourcer exists and recruiter account is active)
     */
    async isSourcerActive(company_id: string): Promise<boolean> {
        const sourcer = await this.findByCompany(company_id);
        if (!sourcer) return false;

        // findByCompany already filters by status='active' on the relationship,
        // now also check if the sourcer's recruiter account is active
        const { data: recruiter, error } = await this.supabase
            .from('recruiters')
            .select('status')
            .eq('id', sourcer.recruiter_id)
            .single();

        if (error || !recruiter) return false;

        return recruiter.status === 'active';
    }
}
