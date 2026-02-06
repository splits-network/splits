/**
 * Recruiter-Companies Repository - V2
 * Handles recruiter-company relationship data access with role-based filtering
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';
import { RecruiterCompany, RecruiterCompanyCreate, RecruiterCompanyUpdate, RecruiterCompanyFilters } from './types';

export class RecruiterCompanyRepository {
    constructor(private supabase: SupabaseClient) {}

    async list(
        clerkUserId: string,
        params: StandardListParams & RecruiterCompanyFilters
    ): Promise<StandardListResponse<RecruiterCompany>> {
        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
        
        // Build base query with enriched data
        let query = this.supabase
            
            .from('recruiter_companies')
            .select(`
                *,
                recruiter:recruiters!inner(
                    id,
                    user_id,
                    user:users!inner(name, email)
                ),
                company:companies!inner(
                    id,
                    name,
                    industry,
                    headquarters_location
                )
            `, { count: 'exact' });

        // Apply role-based filtering
        if (!accessContext.isPlatformAdmin) {
            if (accessContext.recruiterId && accessContext.roles.includes('recruiter')) {
                // Recruiters see only their own relationships
                query = query.eq('recruiter_id', accessContext.recruiterId);
            } else if (accessContext.organizationIds.length > 0) {
                // Company users see relationships for their companies
                const { data: companies } = await this.supabase
                    
                    .from('companies')
                    .select('id')
                    .in('identity_organization_id', accessContext.organizationIds);
                
                const companyIds = companies?.map(c => c.id) || [];
                if (companyIds.length === 0) {
                    return { data: [], pagination: { total: 0, page: 1, limit: params.limit || 25, total_pages: 0 } };
                }
                
                query = query.in('company_id', companyIds);
            } else {
                // No access
                return { data: [], pagination: { total: 0, page: 1, limit: params.limit || 25, total_pages: 0 } };
            }
        }

        // Apply filters
        if (params.recruiter_id) {
            query = query.eq('recruiter_id', params.recruiter_id);
        }
        if (params.company_id) {
            query = query.eq('company_id', params.company_id);
        }
        if (params.relationship_type) {
            query = query.eq('relationship_type', params.relationship_type);
        }
        if (params.status) {
            query = query.eq('status', params.status);
        }
        if (params.can_manage_company_jobs !== undefined) {
            query = query.eq('can_manage_company_jobs', params.can_manage_company_jobs);
        }
        
        // Search across recruiter and company names
        if (params.search) {
            query = query.or(`
                recruiter.user.name.ilike.%${params.search}%,
                recruiter.user.email.ilike.%${params.search}%,
                company.name.ilike.%${params.search}%
            `);
        }

        // Apply sorting
        const sortBy = params.sort_by || 'created_at';
        const sortOrder = params.sort_order || 'desc';
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });

        // Apply pagination
        const page = params.page || 1;
        const limit = params.limit || 25;
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;
        if (error) throw error;

        return {
            data: data || [],
            pagination: {
                total: count || 0,
                page,
                limit,
                total_pages: Math.ceil((count || 0) / limit)
            }
        };
    }

    async findById(id: string, clerkUserId: string): Promise<RecruiterCompany | null> {
        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
        
        let query = this.supabase
            
            .from('recruiter_companies')
            .select(`
                *,
                recruiter:recruiters!inner(
                    id,
                    user_id,
                    user:users!inner(name, email)
                ),
                company:companies!inner(
                    id,
                    name,
                    industry,
                    headquarters_location
                )
            `)
            .eq('id', id);

        // Apply role-based filtering
        if (!accessContext.isPlatformAdmin) {
            if (accessContext.recruiterId && accessContext.roles.includes('recruiter')) {
                query = query.eq('recruiter_id', accessContext.recruiterId);
            } else if (accessContext.organizationIds.length > 0) {
                const { data: companies } = await this.supabase
                    
                    .from('companies')
                    .select('id')
                    .in('identity_organization_id', accessContext.organizationIds);
                
                const companyIds = companies?.map(c => c.id) || [];
                query = query.in('company_id', companyIds);
            } else {
                return null;
            }
        }

        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        
        return data;
    }

    async create(
        data: RecruiterCompanyCreate,
        clerkUserId: string
    ): Promise<RecruiterCompany> {
        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
        
        // Authorize company access - only platform admins and company users can create relationships
        if (!accessContext.isPlatformAdmin) {
            if (accessContext.organizationIds.length > 0) {
                const { data: company } = await this.supabase
                    
                    .from('companies')
                    .select('identity_organization_id')
                    .eq('id', data.company_id)
                    .single();
                
                if (!company || !accessContext.organizationIds.includes(company.identity_organization_id)) {
                    throw new Error('Forbidden: Cannot create relationships for companies outside your organization');
                }
            } else {
                throw new Error('Forbidden: Insufficient permissions to create recruiter-company relationship');
            }
        }

        const relationshipData = {
            ...data,
            status: 'pending' as const,
            invited_by: accessContext.identityUserId,
            can_manage_company_jobs: data.can_manage_company_jobs || false
        };

        const { data: result, error } = await this.supabase
            
            .from('recruiter_companies')
            .insert(relationshipData)
            .select(`
                *,
                recruiter:recruiters!inner(
                    id,
                    user_id,
                    user:users!inner(name, email)
                ),
                company:companies!inner(
                    id,
                    name,
                    industry,
                    headquarters_location
                )
            `)
            .single();

        if (error) throw error;
        return result;
    }

    async update(
        id: string,
        updates: RecruiterCompanyUpdate,
        clerkUserId: string
    ): Promise<RecruiterCompany> {
        // First check access to the relationship
        const existing = await this.findById(id, clerkUserId);
        if (!existing) {
            throw new Error('Recruiter-company relationship not found or access denied');
        }

        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
        
        // Set termination metadata if ending relationship
        if (updates.status === 'terminated' && updates.termination_reason) {
            updates.relationship_end_date = new Date().toISOString();
            updates.terminated_by = accessContext.identityUserId || undefined;
        }

        const { data, error } = await this.supabase
            
            .from('recruiter_companies')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select(`
                *,
                recruiter:recruiters!inner(
                    id,
                    user_id,
                    user:users!inner(name, email)
                ),
                company:companies!inner(
                    id,
                    name,
                    industry,
                    headquarters_location
                )
            `)
            .single();

        if (error) throw error;
        return data;
    }

    async delete(id: string, clerkUserId: string): Promise<void> {
        // Check access first
        const existing = await this.findById(id, clerkUserId);
        if (!existing) {
            throw new Error('Recruiter-company relationship not found or access denied');
        }

        // Soft delete by setting status to terminated
        await this.update(id, {
            status: 'terminated',
            termination_reason: 'deleted',
            relationship_end_date: new Date().toISOString()
        }, clerkUserId);
    }

    /**
     * Find recruiter by email for invitation purposes
     */
    async findRecruiterByEmail(email: string): Promise<any> {
        const { data, error } = await this.supabase
            
            .from('recruiters')
            .select(`
                id,
                user_id,
                user:users!inner(name, email)
            `)
            .eq('user.email', email)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    /**
     * Check if active relationship exists
     */
    async hasActiveRelationship(recruiterId: string, companyId: string): Promise<boolean> {
        const { data, error } = await this.supabase

            .from('recruiter_companies')
            .select('id')
            .eq('recruiter_id', recruiterId)
            .eq('company_id', companyId)
            .eq('status', 'active')
            .maybeSingle();

        if (error) throw error;
        return !!data;
    }

    /**
     * Get companies a recruiter can manage jobs for, with details
     */
    async getManageableCompaniesWithDetails(recruiterId: string): Promise<{ id: string; name: string }[]> {
        const { data, error } = await this.supabase
            .from('recruiter_companies')
            .select(`
                company_id,
                company:companies!inner(id, name)
            `)
            .eq('recruiter_id', recruiterId)
            .eq('status', 'active')
            .eq('can_manage_company_jobs', true);

        if (error) throw error;

        return (data || []).map(row => ({
            id: (row.company as any).id,
            name: (row.company as any).name
        }));
    }
}