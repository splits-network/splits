/**
 * Proposal Repository
 * Direct Supabase queries for proposal domain
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ProposalFilters, ProposalUpdate, RepositoryListResponse } from './types';
import { resolveAccessContext } from '../shared/access';

export class ProposalRepository {
    private supabase: SupabaseClient;
    private static readonly TABLE = 'candidate_role_assignments';

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' }
        });
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

        // Build base query (cross-schema relations resolved after initial fetch)
        let query = this.supabase

            .from(ProposalRepository.TABLE)
            .select(`*
                candidate:candidates(id, phone, user:users!user_id(id, name, email)),
                `, { count: 'exact' });

        if (accessContext.recruiterId) {
            // Recruiter sees proposals where they are either candidate or company recruiter
            query = query.or(`candidate_recruiter_id.eq.${accessContext.recruiterId},company_recruiter_id.eq.${accessContext.recruiterId}`);
        } else if (!accessContext.isPlatformAdmin) {
            if (organizationIds.length === 0) {
                return { data: [], total: 0 };
            }
            const accessibleJobIds = await this.findJobIdsForOrganizations(organizationIds);
            if (!accessibleJobIds.length) {
                return { data: [], total: 0 };
            }
            query = query.in('job_id', accessibleJobIds);
        }

        // Apply filters
        if (filters.search) {
            const like = `%${filters.search}%`;
            query = query.or(`proposal_notes.ilike.${like},response_notes.ilike.${like}`);
        }
        if (filters.state) {
            query = query.eq('state', filters.state);
        }
        if (filters.candidate_recruiter_id) {
            query = query.eq('candidate_recruiter_id', filters.candidate_recruiter_id);
        }
        if (filters.company_recruiter_id) {
            query = query.eq('company_recruiter_id', filters.company_recruiter_id);
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

        const enriched = await this.enrichProposals(data || []);

        return {
            data: enriched,
            total: count || 0,
        };
    }

    async findProposal(id: string): Promise<any | null> {
        const { data, error } = await this.supabase

            .from(ProposalRepository.TABLE)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        const enriched = await this.enrichProposals(data ? [data] : []);
        return enriched[0] || null;
    }

    async createProposal(proposal: any): Promise<any> {
        const { data, error } = await this.supabase

            .from(ProposalRepository.TABLE)
            .insert(proposal)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateProposal(id: string, updates: ProposalUpdate): Promise<any> {
        const { data, error } = await this.supabase

            .from(ProposalRepository.TABLE)
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

            .from(ProposalRepository.TABLE)
            .update({ state: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }

    private async findJobIdsForOrganizations(organizationIds: string[]): Promise<string[]> {
        const { data: companies, error: companiesError } = await this.supabase

            .from('companies')
            .select('id, identity_organization_id')
            .in('identity_organization_id', organizationIds);

        if (companiesError) throw companiesError;

        const companyIds = (companies || []).map((company) => company.id).filter(Boolean);
        if (!companyIds.length) {
            return [];
        }

        const { data: jobs, error: jobsError } = await this.supabase

            .from('jobs')
            .select('id, company_id')
            .in('company_id', companyIds);

        if (jobsError) throw jobsError;

        return (jobs || []).map((job) => job.id).filter(Boolean);
    }

    private async enrichProposals(proposals: any[]): Promise<any[]> {
        if (!proposals.length) {
            return [];
        }

        const jobIds = Array.from(new Set(proposals.map((proposal) => proposal.job_id).filter(Boolean)));
        const candidateIds = Array.from(
            new Set(proposals.map((proposal) => proposal.candidate_id).filter(Boolean))
        );
        // Collect both candidate and company recruiter IDs
        const candidateRecruiterIds = Array.from(
            new Set(proposals.map((proposal) => proposal.candidate_recruiter_id).filter(Boolean))
        );
        const companyRecruiterIds = Array.from(
            new Set(proposals.map((proposal) => proposal.company_recruiter_id).filter(Boolean))
        );
        const allRecruiterIds = Array.from(new Set([...candidateRecruiterIds, ...companyRecruiterIds]));

        const [jobs, candidates, recruiters] = await Promise.all([
            this.fetchJobs(jobIds),
            this.fetchCandidates(candidateIds),
            this.fetchRecruiters(allRecruiterIds),
        ]);

        return proposals.map((proposal) => ({
            ...proposal,
            job: proposal.job_id ? jobs.get(proposal.job_id) || null : null,
            candidate: proposal.candidate_id ? candidates.get(proposal.candidate_id) || null : null,
            candidate_recruiter: proposal.candidate_recruiter_id ? recruiters.get(proposal.candidate_recruiter_id) || null : null,
            company_recruiter: proposal.company_recruiter_id ? recruiters.get(proposal.company_recruiter_id) || null : null,
        }));
    }

    private async fetchJobs(jobIds: string[]): Promise<Map<string, any>> {
        if (!jobIds.length) {
            return new Map();
        }

        const { data, error } = await this.supabase

            .from('jobs')
            .select(
                `
                id,
                title,
                location,
                status,
                company:companies!inner(
                    id,
                    name,
                    identity_organization_id
                )
            `
            )
            .in('id', jobIds);

        if (error) throw error;

        return new Map((data || []).map((job) => [job.id, job]));
    }

    private async fetchCandidates(candidateIds: string[]): Promise<Map<string, any>> {
        if (!candidateIds.length) {
            return new Map();
        }

        const { data, error } = await this.supabase

            .from('candidates')
            .select('id, full_name, email, phone')
            .in('id', candidateIds);

        if (error) throw error;

        return new Map((data || []).map((candidate) => [candidate.id, candidate]));
    }

    private async fetchRecruiters(recruiterIds: string[]): Promise<Map<string, any>> {
        if (!recruiterIds.length) {
            return new Map();
        }

        const { data, error } = await this.supabase

            .from('recruiters')
            .select('*')
            .in('id', recruiterIds);

        if (error) throw error;

        const recruiters = data || [];
        const userIds = recruiters.map((recruiter) => recruiter.user_id).filter(Boolean);
        const usersMap = await this.fetchUsers(userIds);

        const recruiterMap = new Map<string, any>();
        recruiters.forEach((recruiter) => {
            const user = recruiter.user_id ? usersMap.get(recruiter.user_id) || null : null;
            recruiterMap.set(recruiter.id, {
                ...recruiter,
                name: user?.name || null,
                email: user?.email || null,
                user,
            });
        });

        return recruiterMap;
    }

    private async fetchUsers(userIds: string[]): Promise<Map<string, any>> {
        if (!userIds.length) {
            return new Map();
        }

        const { data, error } = await this.supabase

            .from('users')
            .select('id, name, email')
            .in('id', userIds);

        if (error) throw error;

        return new Map((data || []).map((user) => [user.id, user]));
    }
}
