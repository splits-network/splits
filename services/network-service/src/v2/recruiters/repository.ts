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
                // Recruiters can only see their own profile
                query = query.eq('user_id', context.identityUserId);
            } else if (context.organizationIds.length > 0) {
                // Company users can see recruiters working on their jobs (future enhancement)
                // For now, no access to recruiter profiles
                return { data: [], total: 0 };
            }
        }
        // Unauthenticated users see all active recruiters (public marketplace)

        // Apply filters with multi-criteria search parsing
        let useRelevanceSort = false;
        if (params.search) {
            const searchTerms = this.parseSearchQuery(params.search);

            // Build multi-field search with relevance scoring
            const searchConditions: string[] = [];

            // Search in name (highest weight)
            searchConditions.push(`name.ilike.%${params.search}%`);

            // Search in email
            searchConditions.push(`email.ilike.%${params.search}%`);

            // Search in specialization (medium weight)
            if (searchTerms.specialization) {
                searchConditions.push(`specialization.ilike.%${searchTerms.specialization}%`);
            }

            // Search in bio (low weight)
            if (searchTerms.skills && searchTerms.skills.length > 0) {
                searchTerms.skills.forEach(skill => {
                    searchConditions.push(`bio.ilike.%${skill}%`);
                    searchConditions.push(`specialization.ilike.%${skill}%`);
                });
            }

            query = query.or(searchConditions.join(','));

            // Use relevance-based sorting when search is active (unless explicitly overridden)
            if (!params.sort_by) {
                useRelevanceSort = true;
            }
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

        // Apply sorting - relevance-based when searching, otherwise by sort_by parameter
        if (useRelevanceSort) {
            // For now, sort by created_at desc as proxy for relevance
            // In future, implement proper ts_rank with tsvector indexes
            query = query.order('created_at', { ascending: false });
        } else {
            const sortBy = params.sort_by || 'created_at';
            const sortOrder = params.sort_order?.toLowerCase() === 'asc' ? true : false;
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
     * Supports: user (joins with identity.users table)
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
                    selectParts.push('users!user_id(id, name, email, created_at)');
                    break;
                // Future includes can be added here
                // case 'stats':
                //     selectParts.push('recruiter_stats(*)');
                //     break;
            }
        }

        return selectParts.join(', ');
    }

    /**
     * Parse search query into structured search terms
     * Extracts: skills/keywords, years of experience, location, specialization
     */
    private parseSearchQuery(search: string): {
        skills: string[];
        years?: number;
        location?: string;
        specialization?: string;
    } {
        const terms = search.toLowerCase().trim();
        const result: any = {
            skills: []
        };

        // Extract years of experience (e.g., "5 years", "10+ years")
        const yearsMatch = terms.match(/(\d+)\+?\s*(?:years?|yrs?)/i);
        if (yearsMatch) {
            result.years = parseInt(yearsMatch[1]);
        }

        // Extract location keywords (common cities/states)
        const locationKeywords = ['california', 'ca', 'san francisco', 'sf', 'new york', 'ny', 'nyc',
            'texas', 'tx', 'austin', 'seattle', 'boston', 'remote'];
        for (const location of locationKeywords) {
            if (terms.includes(location)) {
                result.location = location;
                break;
            }
        }

        // Extract specialization/role keywords
        const specializationKeywords = ['tech', 'technology', 'engineering', 'software', 'sales',
            'marketing', 'finance', 'healthcare', 'executive'];
        for (const spec of specializationKeywords) {
            if (terms.includes(spec)) {
                result.specialization = spec;
                break;
            }
        }

        // Split into individual skill keywords (filter out stop words)
        const stopWords = ['the', 'and', 'or', 'for', 'with', 'years', 'year', 'yrs', 'yr'];
        const words = terms.split(/\s+/).filter(word =>
            word.length > 2 && !stopWords.includes(word) && !word.match(/^\d+$/)
        );
        result.skills = words;

        return result;
    }
}
