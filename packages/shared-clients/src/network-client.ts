import { BaseClient, BaseClientConfig, ApiResponse } from './base-client';
import {
    Recruiter,
    RoleAssignment,
    RecruiterReputation,
} from '@splits-network/shared-types';

/**
 * Client for Network Service (Phase 1 + Phase 2)
 */
export class NetworkClient extends BaseClient {
    constructor(config: BaseClientConfig) {
        super(config);
    }

    // ========================================================================
    // Phase 1: Recruiters
    // ========================================================================

    async listRecruiters(): Promise<ApiResponse<Recruiter[]>> {
        return this.get('/recruiters');
    }

    async getRecruiter(recruiterId: string): Promise<ApiResponse<Recruiter>> {
        return this.get(`/recruiters/${recruiterId}`);
    }

    async getRecruiterByClerkUserId(clerkUserId: string): Promise<ApiResponse<Recruiter>> {
        return this.get(`/recruiters/by-user/${clerkUserId}`);
    }

    async createRecruiter(data: {
        clerk_user_id: string;
        bio?: string;
        industries?: string[];
        specialties?: string[];
        location?: string;
        tagline?: string;
        years_experience?: number;
    }): Promise<ApiResponse<Recruiter>> {
        return this.post('/recruiters', data);
    }

    async updateRecruiter(recruiterId: string, data: Partial<Recruiter>): Promise<ApiResponse<Recruiter>> {
        return this.put(`/recruiters/${recruiterId}`, data);
    }

    // ========================================================================
    // Phase 1: Role Assignments
    // ========================================================================

    async listRoleAssignments(jobId?: string): Promise<ApiResponse<RoleAssignment[]>> {
        const query = jobId ? `?job_id=${jobId}` : '';
        return this.get(`/assignments${query}`);
    }

    async assignRecruiterToRole(data: {
        job_id: string;
        recruiter_id: string;
        assigned_by?: string;
    }): Promise<ApiResponse<RoleAssignment>> {
        return this.post('/assignments', data);
    }

    async removeRoleAssignment(assignmentId: string): Promise<ApiResponse<void>> {
        return this.delete(`/assignments/${assignmentId}`);
    }

    // ========================================================================
    // Phase 2: Candidate-Role Assignment Proposals - DEPRECATED
    // Note: CRA system replaced by application stage workflow
    // These methods are deprecated and should not be used
    // ========================================================================

    /**
     * @deprecated CRA system replaced by application stage workflow
     * Use application-based proposal system instead
     */
    async createProposal(): Promise<never> {
        throw new Error('CRA proposals are deprecated - use application stage workflow instead');
    }

    /**
     * @deprecated CRA system replaced by application stage workflow
     */
    async getProposal(): Promise<never> {
        throw new Error('CRA proposals are deprecated - use application stage workflow instead');
    }

    /**
     * @deprecated CRA system replaced by application stage workflow
     */
    async listProposals(): Promise<never> {
        throw new Error('CRA proposals are deprecated - use application stage workflow instead');
    }

    /**
     * @deprecated CRA system replaced by application stage workflow
     */
    async acceptProposal(): Promise<never> {
        throw new Error('CRA proposals are deprecated - use application stage workflow instead');
    }

    /**
     * @deprecated CRA system replaced by application stage workflow
     */
    async declineProposal(): Promise<never> {
        throw new Error('CRA proposals are deprecated - use application stage workflow instead');
    }

    /**
     * @deprecated CRA system replaced by application stage workflow
     */
    async markProposalSubmitted(): Promise<never> {
        throw new Error('CRA proposals are deprecated - use application stage workflow instead');
    }

    /**
     * @deprecated CRA system replaced by application stage workflow
     */
    async closeProposal(): Promise<never> {
        throw new Error('CRA proposals are deprecated - use application stage workflow instead');
    }

    // ========================================================================
    // Phase 2: Recruiter Reputation
    // ========================================================================

    async getRecruiterReputation(recruiterId: string): Promise<ApiResponse<RecruiterReputation>> {
        return this.get(`/recruiters/${recruiterId}/reputation`);
    }

    async refreshRecruiterReputation(recruiterId: string): Promise<ApiResponse<RecruiterReputation>> {
        return this.post(`/recruiters/${recruiterId}/reputation/refresh`, {});
    }

    async getTopRecruiters(filters?: {
        limit?: number;
        metric?: 'reputation_score' | 'hire_rate' | 'completion_rate';
    }): Promise<ApiResponse<Array<{
        recruiter: Recruiter;
        reputation: RecruiterReputation;
    }>>> {
        const queryParams = new URLSearchParams();
        if (filters?.limit) queryParams.set('limit', filters.limit.toString());
        if (filters?.metric) queryParams.set('metric', filters.metric);

        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return this.get(`/leaderboard${query}`);
    }
}
