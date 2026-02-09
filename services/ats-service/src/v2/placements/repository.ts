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

        // Build query with enriched data
        let query = this.supabase

            .from('placements')
            .select(`
                *,
                candidate:candidates(id, full_name, email),
                job:jobs!inner(
                    id, 
                    title,
                    company:companies!inner(id, name, identity_organization_id)
                ),
                application:applications(id, stage)
            `, { count: 'exact' });

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
            const tsquery = filters.search.split(/\s+/).filter((t: string) => t.trim()).join(' & ');
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

        const placements = data || [];

        // Enrich with the current recruiter's split from placement_splits
        if (accessContext.recruiterId && placements.length > 0) {
            const placementIds = placements.map((p: any) => p.id);
            const { data: splits } = await this.supabase
                .from('placement_splits')
                .select('placement_id, split_amount')
                .eq('recruiter_id', accessContext.recruiterId)
                .in('placement_id', placementIds);

            if (splits && splits.length > 0) {
                const splitMap = new Map<string, number>();
                for (const s of splits) {
                    // Sum all roles for this recruiter on each placement
                    splitMap.set(s.placement_id, (splitMap.get(s.placement_id) || 0) + s.split_amount);
                }
                for (const p of placements) {
                    const amount = splitMap.get(p.id);
                    if (amount !== undefined) {
                        p.recruiter_share = amount;
                    }
                }
            }
        }

        return {
            data: placements,
            total: count || 0,
        };
    }

    async findPlacement(id: string, clerkUserId?: string): Promise<any | null> {
        const { data, error } = await this.supabase

            .from('placements')
            .select(`
                *,
                candidate:candidates(id, full_name, email, phone),
                job:jobs(
                    id,
                    title,
                    company:companies(id, name)
                ),
                application:applications(id, stage)
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        // Enrich with the current recruiter's split from placement_splits
        if (clerkUserId && data) {
            const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
            if (accessContext.recruiterId) {
                const { data: splits } = await this.supabase
                    .from('placement_splits')
                    .select('split_amount')
                    .eq('placement_id', id)
                    .eq('recruiter_id', accessContext.recruiterId);

                if (splits && splits.length > 0) {
                    data.recruiter_share = splits.reduce((sum: number, s: any) => sum + s.split_amount, 0);
                }
            }
        }

        return data;
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
