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
        params: RecruiterFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = params.page || 1;
        const limit = params.limit || 25;
        const offset = (page - 1) * limit;

        // Build select clause with optional includes
        const selectClause = this.buildSelectClause(params.include);

        // Build query
        let query = this.supabase

            .from('recruiters')
            .select(selectClause, { count: 'exact' });

        // If user is authenticated, apply role-based filtering
        if (clerkUserId) {
            const context = await resolveAccessContext(this.supabase, clerkUserId);

            // Platform admins see all recruiters (no filter)
            if (context.isPlatformAdmin) {
                // No filter applied - admin sees all
            } else if (context.recruiterId) {
                // Recruiters can only see their own profile when viewing specific recruiter details
                // But can browse all active recruiters in marketplace (same as unauthenticated)
                // Note: The /me endpoint handles viewing own profile separately
            } else if (context.organizationIds.length > 0) {
                // Company users can browse all active recruiters in the marketplace
                // They need this access to discover and invite recruiters
            }
        }
        // All users (authenticated or not) can browse active recruiters in the marketplace

        // Apply full-text search using tsvector
        if (params.search) {
            const tsquery = params.search
                .replace(/[@+._\-\/:]/g, ' ')
                .trim()
                .split(/\s+/)
                .filter((t: string) => t)
                .join(' & ');
            query = query.textSearch('search_vector', tsquery, {
                type: 'websearch',
                config: 'english',
            });
        }

        if (params.status) {
            query = query.eq('status', params.status);
        }

        if (params.specialization && !params.search) {
            query = query.ilike('specialization', `%${params.specialization}%`);
        }

        if (params.filters?.marketplace_enabled !== undefined) {
            query = query.eq('marketplace_enabled', params.filters?.marketplace_enabled);
        }

        // Apply sorting
        const sortBy = params.sort_by || 'created_at';
        const sortOrder = params.sort_order?.toLowerCase() === 'asc' ? true : false;

        // Columns that live on recruiter_reputation (joined table), not recruiters
        const reputationColumns = new Set([
            'reputation_score', 'total_submissions', 'total_hires',
            'hire_rate', 'completion_rate', 'quality_score',
            'avg_time_to_hire_days', 'avg_response_time_hours',
        ]);

        if (reputationColumns.has(sortBy)) {
            query = query.order(sortBy, { ascending: sortOrder, referencedTable: 'recruiter_reputation' });
        } else {
            query = query.order(sortBy, { ascending: sortOrder });
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            data: data || [],
            total: count || 0,
        };
    }

    async findRecruiter(id: string, clerkUserId: string | undefined, include?: string): Promise<any | null> {
        // If no user context, allow viewing active public recruiter profiles
        let context: AccessContext | null = null;
        if (clerkUserId) {
            context = await resolveAccessContext(this.supabase, clerkUserId);
        }

        // Build select clause with optional includes
        const selectClause = this.buildSelectClause(include);

        const { data, error } = await this.supabase

            .from('recruiters')
            .select(selectClause)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        if (!data) return null;

        // Apply role-based filtering - only for authenticated requests
        // For public requests (context is null), allow viewing active recruiter profiles
        if (context && context.roles.includes('recruiter') && data && 'user_id' in data && context.identityUserId !== data.user_id) {
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

    async findByClerkUserId(clerkUserId: string): Promise<any | null> {
        const context = await resolveAccessContext(this.supabase, clerkUserId);

        const { data, error } = await this.supabase

            .from('recruiters')
            .select('*')
            .eq('user_id', context.identityUserId)
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

    /**
     * Build select clause with optional includes
     * Supports: user (joins with identity.users table), reputation (joins with recruiter_reputation table)
     */
    private buildSelectClause(include?: string): string {
        const baseFields = '*';

        if (!include) {
            return baseFields;
        }

        const includes = include.split(',').map(i => i.trim());
        const selectParts: string[] = [baseFields];

        for (const inc of includes) {
            switch (inc) {
                case 'user':
                    // JOIN with identity.users table via user_id foreign key
                    // Using Supabase's select syntax for cross-schema joins
                    // Format: user:users!user_id(fields) where users is in identity schema
                    selectParts.push('users!user_id(id, name, email, created_at, profile_image_url)');
                    break;
                case 'reputation':
                    // JOIN with recruiter_reputation table via recruiter_id foreign key
                    selectParts.push('recruiter_reputation!recruiter_id(recruiter_id, total_submissions, total_hires, hire_rate, total_placements, completed_placements, failed_placements, completion_rate, total_collaborations, collaboration_rate, avg_response_time_hours, reputation_score, last_calculated_at, created_at, updated_at)');
                    break;
                case 'firm':
                    // JOIN through firm_members → firms to get the recruiter's firm name
                    selectParts.push('firm_members!recruiter_id(firm_id, role, firms!firm_id(id, name, slug))');
                    break;
                case 'activity':
                    // JOIN with recruiter_activity_recent view (latest 5 per recruiter)
                    selectParts.push('recruiter_activity_recent!recruiter_id(id, activity_type, description, metadata, created_at)');
                    break;
                case 'response_metrics':
                    // Handled separately via getResponseMetrics() — view has no FK for PostgREST join
                    break;
            }
        }

        return selectParts.join(', ');
    }


    async findRecruiterBySlug(slug: string, include?: string): Promise<any | null> {
        const selectClause = this.buildSelectClause(include);

        const { data, error } = await this.supabase
            .from('recruiters')
            .select(selectClause)
            .eq('slug', slug)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    async isSlugTaken(slug: string, excludeRecruiterId?: string): Promise<boolean> {
        let query = this.supabase
            .from('recruiters')
            .select('id')
            .eq('slug', slug);

        if (excludeRecruiterId) {
            query = query.neq('id', excludeRecruiterId);
        }

        const { data } = await query.maybeSingle();
        return !!data;
    }

    /**
     * Fetch response metrics from the analytics bridge view.
     * Separate query because the view has no FK for PostgREST relational joins.
     */
    async getResponseMetrics(recruiterId: string): Promise<{ response_rate: number | null; avg_response_time_hours: number | null } | null> {
        const { data, error } = await this.supabase
            .from('recruiter_response_metrics_latest')
            .select('response_rate, avg_response_time_hours')
            .eq('recruiter_id', recruiterId)
            .maybeSingle();

        if (error) return null;
        return data;
    }

    /**
     * Create a user_role entry for a recruiter.
     * Used during recruiter creation to explicitly assign the 'recruiter' role.
     */
    async createRecruiterUserRole(userId: string, recruiterId: string): Promise<void> {
        const { error } = await this.supabase
            .from('user_roles')
            .insert({
                user_id: userId,
                role_name: 'recruiter',
                role_entity_id: recruiterId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

        // Ignore unique constraint violations (role already exists)
        if (error && !error.message?.includes('duplicate') && error.code !== '23505') {
            throw error;
        }
    }
}
