import { BaseClient, BaseClientConfig, ApiResponse } from './base-client';
import {
    Job,
    Candidate,
    Application,
    Placement,
    CandidateSourcer,
    PlacementCollaborator,
    CandidateOutreach,
} from '@splits-network/shared-types';

/**
 * Client for ATS Service (Phase 1 + Phase 2)
 */
export class AtsClient extends BaseClient {
    constructor(config: BaseClientConfig) {
        super(config);
    }

    // ========================================================================
    // Phase 1: Jobs
    // ========================================================================

    async listJobs(): Promise<ApiResponse<Job[]>> {
        return this.get('/jobs');
    }

    async getJob(jobId: string): Promise<ApiResponse<Job>> {
        return this.get(`/jobs/${jobId}`);
    }

    async createJob(data: {
        company_id: string;
        title: string;
        department?: string;
        location?: string;
        salary_min?: number;
        salary_max?: number;
        fee_percentage: number;
        description?: string;
    }): Promise<ApiResponse<Job>> {
        return this.post('/jobs', data);
    }

    async updateJob(jobId: string, data: Partial<Job>): Promise<ApiResponse<Job>> {
        return this.put(`/jobs/${jobId}`, data);
    }

    // ========================================================================
    // Phase 1: Candidates
    // ========================================================================

    async listCandidates(): Promise<ApiResponse<Candidate[]>> {
        return this.get('/candidates');
    }

    async getCandidate(candidateId: string): Promise<ApiResponse<Candidate>> {
        return this.get(`/candidates/${candidateId}`);
    }

    async createCandidate(data: {
        email: string;
        full_name: string;
        linkedin_url?: string;
    }): Promise<ApiResponse<Candidate>> {
        return this.post('/candidates', data);
    }

    // ========================================================================
    // Phase 1: Applications
    // ========================================================================

    async listApplications(jobId?: string): Promise<ApiResponse<Application[]>> {
        const query = jobId ? `?job_id=${jobId}` : '';
        return this.get(`/applications${query}`);
    }

    async getApplication(applicationId: string): Promise<ApiResponse<Application>> {
        return this.get(`/applications/${applicationId}`);
    }

    async createApplication(data: {
        job_id: string;
        candidate_id: string;
        recruiter_id?: string;
        notes?: string;
    }): Promise<ApiResponse<Application>> {
        return this.post('/applications', data);
    }

    async updateApplicationStage(applicationId: string, stage: string): Promise<ApiResponse<Application>> {
        return this.patch(`/applications/${applicationId}/stage`, { stage });
    }

    // ========================================================================
    // Phase 1: Placements
    // ========================================================================

    async listPlacements(): Promise<ApiResponse<Placement[]>> {
        return this.get('/placements');
    }

    async getPlacement(placementId: string): Promise<ApiResponse<Placement>> {
        return this.get(`/placements/${placementId}`);
    }

    async createPlacement(data: {
        job_id: string;
        candidate_id: string;
        company_id: string;
        recruiter_id: string;
        application_id?: string;
        salary: number;
        fee_percentage: number;
    }): Promise<ApiResponse<Placement>> {
        return this.post('/placements', data);
    }

    // ========================================================================
    // Phase 2: Candidate Ownership
    // ========================================================================

    async sourceCandidate(candidateId: string, data: {
        sourcer_user_id: string;
        sourcer_type?: 'recruiter' | 'tsn';
        protection_window_days?: number;
        notes?: string;
    }): Promise<ApiResponse<CandidateSourcer>> {
        return this.post(`/candidates/${candidateId}/source`, data);
    }

    async getCandidateSourcer(candidateId: string): Promise<ApiResponse<CandidateSourcer | null>> {
        return this.get(`/candidates/${candidateId}/sourcer`);
    }

    async canUserWorkWithCandidate(candidateId: string, userId: string): Promise<ApiResponse<{
        can_work: boolean;
        reason?: string;
        sourcer?: CandidateSourcer;
    }>> {
        return this.get(`/candidates/${candidateId}/can-work/${userId}`);
    }

    // ========================================================================
    // Phase 2: Placement Collaboration
    // ========================================================================

    async addPlacementCollaborator(placementId: string, data: {
        recruiter_user_id: string;
        role: 'sourcer' | 'submitter' | 'closer' | 'support';
        split_percentage: number;
    }): Promise<ApiResponse<PlacementCollaborator>> {
        return this.post(`/placements/${placementId}/collaborators`, data);
    }

    async getPlacementCollaborators(placementId: string): Promise<ApiResponse<PlacementCollaborator[]>> {
        return this.get(`/placements/${placementId}/collaborators`);
    }

    async calculatePlacementSplits(placementId: string, data: {
        total_fee: number;
        sourcer_user_id: string;
        sourcer_percentage: number;
        other_collaborators: Array<{
            recruiter_user_id: string;
            role: string;
            split_percentage: number;
        }>;
    }): Promise<ApiResponse<{
        total_fee: number;
        splits: Array<{
            recruiter_user_id: string;
            role: string;
            split_percentage: number;
            split_amount: number;
        }>;
    }>> {
        return this.post(`/placements/${placementId}/calculate-splits`, data);
    }

    // ========================================================================
    // Phase 2: Placement Lifecycle
    // ========================================================================

    async transitionPlacementState(placementId: string, data: {
        new_state: 'hired' | 'active' | 'completed' | 'failed';
        start_date?: string;
        end_date?: string;
        failure_reason?: string;
    }): Promise<ApiResponse<Placement>> {
        return this.post(`/placements/${placementId}/transition`, data);
    }

    async checkGuaranteeStatus(placementId: string): Promise<ApiResponse<{
        within_guarantee: boolean;
        guarantee_expires_at?: string;
        days_remaining?: number;
    }>> {
        return this.get(`/placements/${placementId}/guarantee-status`);
    }

    async createReplacementPlacement(failedPlacementId: string, data: {
        new_candidate_id: string;
    }): Promise<ApiResponse<Placement>> {
        return this.post(`/placements/${failedPlacementId}/replacement`, data);
    }

    // ========================================================================
    // Phase 2: Outreach
    // ========================================================================

    async recordOutreach(data: {
        candidate_id: string;
        recruiter_user_id: string;
        job_id?: string;
        email_subject: string;
        email_body: string;
    }): Promise<ApiResponse<CandidateOutreach>> {
        return this.post('/outreach', data);
    }

    async getCandidateOutreach(candidateId: string): Promise<ApiResponse<CandidateOutreach[]>> {
        return this.get(`/candidates/${candidateId}/outreach`);
    }
}
