/**
 * Placement Repository
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PlacementFilters, PlacementUpdate } from './types';
import { resolveAccessContext } from '../shared/access';

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}

export class PlacementRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
    }

    getSupabase(): SupabaseClient {
        return this.supabase;
    }

    /**
     * Build select clause with optional includes.
     * Supports: candidate, job, company, splits
     */
    private buildSelectClause(include?: string): string {
        const baseFields = `*`;

        if (!include) {
            return baseFields;
        }

        const includes = include.split(',').map(i => i.trim());
        let selectClause = baseFields;

        if (includes.includes('candidate')) {
            selectClause += `, candidate:candidates(id, full_name, email)`;
        }

        if (includes.includes('job') || includes.includes('company')) {
            selectClause += `, job:jobs!inner(id, title, company:companies!inner(id, name, logo_url, identity_organization_id))`;
        }

        if (includes.includes('splits')) {
            selectClause += `, splits:placement_splits(id, role, split_percentage, split_amount, recruiter_id, recruiter:recruiters(id, user:users!recruiters_user_id_fkey(name)))`;
        }

        return selectClause;
    }

    async findPlacements(
        clerkUserId: string,
        filters: PlacementFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
        const organizationIds = accessContext.organizationIds;

        if (!accessContext.candidateId && !accessContext.recruiterId && !accessContext.isPlatformAdmin && organizationIds.length === 0) {
            return { data: [], total: 0 };
        }

        const selectClause = this.buildSelectClause(filters.include);

        let query = this.supabase
            .from('placements')
            .select(selectClause, { count: 'exact' });

        // Apply access control filter
        if (accessContext.candidateId) {
            query = query.eq('candidate_id', accessContext.candidateId);
        } else if (accessContext.recruiterId) {
            // Recruiters see placements where they are any recruiter role
            query = query.or(
                `candidate_recruiter_id.eq.${accessContext.recruiterId},` +
                `company_recruiter_id.eq.${accessContext.recruiterId},` +
                `job_owner_recruiter_id.eq.${accessContext.recruiterId},` +
                `candidate_sourcer_recruiter_id.eq.${accessContext.recruiterId},` +
                `company_sourcer_recruiter_id.eq.${accessContext.recruiterId}`
            );
        } else if (!accessContext.isPlatformAdmin && organizationIds.length > 0) {
            query = query.in('job.company.identity_organization_id', organizationIds);
        }

        // Apply filters
        if (filters.search) {
            const tsquery = filters.search.replace(/[@+._\-\/:]/g, ' ').trim().split(/\s+/).filter((t: string) => t).join(' & ');
            query = query.textSearch('search_vector', tsquery, {
                type: 'websearch',
                config: 'english'
            });
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.job_id) {
            query = query.eq('job_id', filters.job_id);
        }
        if (filters.candidate_id) {
            query = query.eq('candidate_id', filters.candidate_id);
        }

        // Apply sorting
        const sortBy = filters.sort_by || 'created_at';
        const sortOrder = filters.sort_order?.toLowerCase() === 'asc' ? true : false;
        query = query.order(sortBy, { ascending: sortOrder });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        const placements = (data || []) as any[];

        // Enrich with the current recruiter's splits from placement_splits
        if (accessContext.recruiterId && placements.length > 0) {
            const placementIds = placements.map((p: any) => p.id);
            const { data: splits } = await this.supabase
                .from('placement_splits')
                .select('placement_id, role, split_percentage, split_amount')
                .eq('recruiter_id', accessContext.recruiterId)
                .in('placement_id', placementIds);

            if (splits && splits.length > 0) {
                const splitMap = new Map<string, { total: number; details: any[] }>();
                for (const s of splits) {
                    const existing = splitMap.get(s.placement_id) || { total: 0, details: [] };
                    existing.total += s.split_amount;
                    existing.details.push({ role: s.role, split_percentage: s.split_percentage, split_amount: s.split_amount });
                    splitMap.set(s.placement_id, existing);
                }
                for (const p of placements) {
                    const entry = splitMap.get(p.id);
                    if (entry) {
                        p.recruiter_share = entry.total;
                        p.your_splits = entry.details;
                    }
                }
            }
        }

        return {
            data: placements,
            total: count || 0,
        };
    }

    async findPlacement(id: string, clerkUserId?: string, include?: string): Promise<any | null> {
        const selectClause = this.buildSelectClause(include || 'candidate,job,company,splits');

        const { data, error } = await this.supabase
            .from('placements')
            .select(selectClause)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        const placement = data as any;

        // Enrich with the current recruiter's splits from placement_splits
        if (clerkUserId && placement) {
            const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
            if (accessContext.recruiterId) {
                const { data: splits } = await this.supabase
                    .from('placement_splits')
                    .select('role, split_percentage, split_amount')
                    .eq('placement_id', id)
                    .eq('recruiter_id', accessContext.recruiterId);

                if (splits && splits.length > 0) {
                    placement.recruiter_share = splits.reduce((sum: number, s: any) => sum + s.split_amount, 0);
                    placement.your_splits = splits.map((s: any) => ({
                        role: s.role, split_percentage: s.split_percentage, split_amount: s.split_amount
                    }));
                }
            }
        }

        return placement;
    }

    async createPlacement(placement: any): Promise<any> {
        const { data, error } = await this.supabase

            .from('placements')
            .insert(placement)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updatePlacement(id: string, updates: PlacementUpdate): Promise<any> {
        const { data, error } = await this.supabase

            .from('placements')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deletePlacement(id: string): Promise<void> {
        // Soft delete
        const { error } = await this.supabase

            .from('placements')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }
}
