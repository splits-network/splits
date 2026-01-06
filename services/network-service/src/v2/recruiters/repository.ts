/**
 * Recruiter Repository
 * Direct Supabase queries for recruiter domain
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext, AccessContext } from '@splits-network/shared-access-context';
import { RecruiterFilters, RecruiterUpdate, RepositoryListResponse } from './types';

export class RecruiterRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: {
                schema: 'public'
            }
        });
    }

    async findRecruiters(
        clerkUserId: string | undefined,
        filters: RecruiterFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        // Build query
        let query = this.supabase
            
            .from('recruiters')
            .select('*', { count: 'exact' });

        // If user is authenticated, apply role-based filtering
        if (clerkUserId) {
            const context = await resolveAccessContext(this.supabase, clerkUserId);
            
            if (context.recruiterId) {
                // Recruiters can only see their own profile
                query = query.eq('user_id', context.identityUserId);
            } else if (context.organizationIds.length > 0) {
                // Company users can see recruiters working on their jobs (future enhancement)
                // For now, no access to recruiter profiles
                return { data: [], total: 0 };
            }
            // Platform admins see all recruiters (no filter)
        }
        // Unauthenticated users see all active recruiters (public marketplace)

        // Apply filters
        if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.specialization) {
            query = query.ilike('specialization', `%${filters.specialization}%`);
        }

        // Apply sorting
        const sortBy = filters.sort_by || 'created_at';
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

    async findRecruiter(id: string, clerkUserId: string | undefined): Promise<any | null> {
        // If no user context, allow viewing active public recruiter profiles
        let context: AccessContext | null = null;
        if (clerkUserId) {
            context = await resolveAccessContext(this.supabase, clerkUserId);
        }

        const { data, error } = await this.supabase
            
            .from('recruiters')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        // Apply role-based filtering - only for authenticated requests
        // For public requests (context is null), allow viewing active recruiter profiles
        if (context && context.roles.includes('recruiter') && context.identityUserId !== data.user_id) {
            // Recruiters can only see their own full profile details
            // Other recruiters are visible but with limited info
            return null;
        }

        return data;
    }

    async findRecruiterByUserId(userId: string): Promise<any | null> {
        const { data, error } = await this.supabase
            
            .from('recruiters')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async createRecruiter(recruiter: any): Promise<any> {
        const { data, error } = await this.supabase
            
            .from('recruiters')
            .insert(recruiter)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateRecruiter(id: string, updates: RecruiterUpdate): Promise<any> {
        const { data, error } = await this.supabase
            
            .from('recruiters')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteRecruiter(id: string): Promise<void> {
        // Soft delete
        const { error } = await this.supabase
            
            .from('recruiters')
            .update({ status: 'inactive', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }
}
