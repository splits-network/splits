/**
 * Proposal Repository
 * Direct Supabase queries for proposal domain
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ProposalFilters, ProposalUpdate, RepositoryListResponse } from './types';
import { resolveAccessContext } from '../shared/access';

export class ProposalRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async findProposals(
        clerkUserId: string,
        filters: ProposalFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
        const organizationIds = accessContext.organizationIds;

        // Build query with enriched data
        let query = this.supabase
            .schema('network')
            .from('proposals')
            .select(`
                *,
                recruiter:recruiters(id, name, email),
                job:ats.jobs!inner(
                    id,
                    title,
                    company:ats.companies!inner(id, name, identity_organization_id)
                ),
                candidate:ats.candidates(id, full_name, email)
            `, { count: 'exact' });

        if (accessContext.recruiterId) {
            query = query.eq('recruiter_id', accessContext.recruiterId);
        } else if (!accessContext.isPlatformAdmin) {
            if (organizationIds.length === 0) {
                return { data: [], total: 0 };
            }
            query = query.in('job.company.identity_organization_id', organizationIds);
        }

        // Apply filters
        if (filters.search) {
            query = query.or(`notes.ilike.%${filters.search}%`);
        }
        if (filters.state) {
            query = query.eq('state', filters.state);
        }
        if (filters.recruiter_id) {
            query = query.eq('recruiter_id', filters.recruiter_id);
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

        return {
            data: data || [],
            total: count || 0,
        };
    }

    async findProposal(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .schema('network')
            .from('proposals')
            .select(`
                *,
                recruiter:recruiters(id, name, email),
                job:ats.jobs(
                    id,
                    title,
                    company:ats.companies(id, name)
                ),
                candidate:ats.candidates(id, full_name, email, phone)
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async createProposal(proposal: any): Promise<any> {
        const { data, error } = await this.supabase
            .schema('network')
            .from('proposals')
            .insert(proposal)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateProposal(id: string, updates: ProposalUpdate): Promise<any> {
        const { data, error } = await this.supabase
            .schema('network')
            .from('proposals')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteProposal(id: string): Promise<void> {
        // Soft delete
        const { error } = await this.supabase
            .schema('network')
            .from('proposals')
            .update({ state: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }
}
