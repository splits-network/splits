/**
 * V2 Repository - Single file for all Network resources
 * Direct Supabase queries, no SQL functions
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
    RepositoryListResponse,
    RecruiterFilters,
    AssignmentFilters,
    RecruiterCandidateFilters,
    ReputationFilters,
    ProposalFilters,
    RecruiterUpdate,
    AssignmentUpdate,
    RecruiterCandidateUpdate,
    ReputationUpdate,
    ProposalUpdate,
} from './types';

export class RepositoryV2 {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    // ============================================
    // RECRUITERS
    // ============================================

    async findRecruiters(
        clerkUserId: string,
        filters: RecruiterFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        // Build query
        let query = this.supabase
            .schema('network')
            .from('recruiters')
            .select('*', { count: 'exact' });

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

    async findRecruiter(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .schema('network')
            .from('recruiters')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async findRecruiterByUserId(userId: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .schema('network')
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
            .schema('network')
            .from('recruiters')
            .insert(recruiter)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateRecruiter(id: string, updates: RecruiterUpdate): Promise<any> {
        const { data, error } = await this.supabase
            .schema('network')
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
            .schema('network')
            .from('recruiters')
            .update({ status: 'inactive', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }

    // ============================================
    // ASSIGNMENTS (role assignments)
    // ============================================

    async findAssignments(
        clerkUserId: string,
        filters: AssignmentFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        // Get user's organization IDs (for role-based scoping)
        const { data: memberships } = await this.supabase
            .schema('identity')
            .from('memberships')
            .select('organization_id')
            .eq('user_id', clerkUserId);

        const organizationIds = memberships?.map((m) => m.organization_id) || [];

        // Build query with enriched data
        let query = this.supabase
            .schema('network')
            .from('role_assignments')
            .select(`
                *,
                recruiter:recruiters(id, name, email),
                job:ats.jobs(
                    id,
                    title,
                    company:ats.companies!inner(id, name, identity_organization_id)
                )
            `, { count: 'exact' });

        // Apply organization filter
        if (organizationIds.length > 0) {
            // This will filter via the nested job.company relationship
            query = query.in('job.company.identity_organization_id', organizationIds);
        }

        // Apply filters
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.recruiter_id) {
            query = query.eq('recruiter_id', filters.recruiter_id);
        }
        if (filters.job_id) {
            query = query.eq('job_id', filters.job_id);
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

    async findAssignment(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .schema('network')
            .from('role_assignments')
            .select(`
                *,
                recruiter:recruiters(id, name, email),
                job:ats.jobs(
                    id,
                    title,
                    company:ats.companies(id, name)
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async createAssignment(assignment: any): Promise<any> {
        const { data, error } = await this.supabase
            .schema('network')
            .from('role_assignments')
            .insert(assignment)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateAssignment(id: string, updates: AssignmentUpdate): Promise<any> {
        const { data, error } = await this.supabase
            .schema('network')
            .from('role_assignments')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteAssignment(id: string): Promise<void> {
        // Soft delete
        const { error } = await this.supabase
            .schema('network')
            .from('role_assignments')
            .update({ status: 'inactive', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }

    // ============================================
    // RECRUITER-CANDIDATES (relationships)
    // ============================================

    async findRecruiterCandidates(
        clerkUserId: string,
        filters: RecruiterCandidateFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        // Build query with enriched data
        let query = this.supabase
            .schema('network')
            .from('recruiter_candidates')
            .select(`
                *,
                recruiter:recruiters(id, name, email),
                candidate:ats.candidates(id, first_name, last_name, email)
            `, { count: 'exact' });

        // Apply filters
        if (filters.recruiter_id) {
            query = query.eq('recruiter_id', filters.recruiter_id);
        }
        if (filters.candidate_id) {
            query = query.eq('candidate_id', filters.candidate_id);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
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

    async findRecruiterCandidate(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .schema('network')
            .from('recruiter_candidates')
            .select(`
                *,
                recruiter:recruiters(id, name, email),
                candidate:ats.candidates(id, first_name, last_name, email, phone)
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async createRecruiterCandidate(relationship: any): Promise<any> {
        const { data, error } = await this.supabase
            .schema('network')
            .from('recruiter_candidates')
            .insert(relationship)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateRecruiterCandidate(id: string, updates: RecruiterCandidateUpdate): Promise<any> {
        const { data, error } = await this.supabase
            .schema('network')
            .from('recruiter_candidates')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteRecruiterCandidate(id: string): Promise<void> {
        // Soft delete
        const { error } = await this.supabase
            .schema('network')
            .from('recruiter_candidates')
            .update({ status: 'inactive', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }

    // ============================================
    // REPUTATION
    // ============================================

    async findReputations(
        clerkUserId: string,
        filters: ReputationFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        // Build query
        let query = this.supabase
            .schema('network')
            .from('recruiter_reputation')
            .select(`
                *,
                recruiter:recruiters(id, name, email)
            `, { count: 'exact' });

        // Apply filters
        if (filters.recruiter_id) {
            query = query.eq('recruiter_id', filters.recruiter_id);
        }

        // Apply sorting
        const sortBy = filters.sort_by || 'rating';
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

    async findReputation(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .schema('network')
            .from('recruiter_reputation')
            .select(`
                *,
                recruiter:recruiters(id, name, email)
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async findReputationByRecruiterId(recruiterId: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .schema('network')
            .from('recruiter_reputation')
            .select('*')
            .eq('recruiter_id', recruiterId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async createReputation(reputation: any): Promise<any> {
        const { data, error } = await this.supabase
            .schema('network')
            .from('recruiter_reputation')
            .insert(reputation)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateReputation(id: string, updates: ReputationUpdate): Promise<any> {
        const { data, error } = await this.supabase
            .schema('network')
            .from('recruiter_reputation')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteReputation(id: string): Promise<void> {
        // Hard delete for reputation (or could soft delete)
        const { error } = await this.supabase
            .schema('network')
            .from('recruiter_reputation')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // ============================================
    // PROPOSALS
    // ============================================

    async findProposals(
        clerkUserId: string,
        filters: ProposalFilters = {}
    ): Promise<RepositoryListResponse<any>> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        // Get user's organization IDs
        const { data: memberships } = await this.supabase
            .schema('identity')
            .from('memberships')
            .select('organization_id')
            .eq('user_id', clerkUserId);

        const organizationIds = memberships?.map((m) => m.organization_id) || [];

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
                candidate:ats.candidates(id, first_name, last_name, email)
            `, { count: 'exact' });

        // Apply organization filter
        if (organizationIds.length > 0) {
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
                candidate:ats.candidates(id, first_name, last_name, email, phone)
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
