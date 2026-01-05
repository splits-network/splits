/**
 * Portal App API Client
 * 
 * This module provides a comprehensive wrapper around the shared API client
 * for portal-specific operations. It maintains compatibility with existing
 * portal code while using the standardized shared client internally.
 */

import { SplitsApiClient, type ApiResponse } from '@splits-network/shared-api-client';
import type { ApplicationStage } from '@splits-network/shared-types';
type DashboardStats = Record<string, any>;

/**
 * Portal API client - wrapper around shared client for compatibility
 */
export class ApiClient {
    private client: SplitsApiClient;

    constructor(token?: string) {
        this.client = new SplitsApiClient();
        if (token) {
            this.client.setAuthToken(token);
        }
    }

    /**
     * Set authentication token
     */
    setToken(token: string): void {
        this.client.setAuthToken(token);
    }

    /**
     * Remove authentication token
     */
    clearToken(): void {
        this.client.clearAuthToken();
    }

    // ===== GENERIC HTTP METHODS =====
    
    async get<T = any>(endpoint: string, options?: { params?: Record<string, any> }): Promise<T> {
        const response = await this.client.get(endpoint, options?.params);
        return response as T;
    }

    async post<T = any>(endpoint: string, data?: any): Promise<T> {
        const response = await this.client.post(endpoint, data);
        return response as T;
    }

    async patch<T = any>(endpoint: string, data?: any): Promise<T> {
        const response = await this.client.patch(endpoint, data);
        return response as T;
    }

    async delete<T = any>(endpoint: string): Promise<T> {
        const response = await this.client.delete(endpoint);
        return response as T;
    }

    // ===== USER AND ROLE METHODS =====
    
    /**
     * Get current user information
     */
    async getCurrentUser() {
        return this.client.getCurrentUser();
    }

    async getUserRoles(): Promise<{
        isRecruiter: boolean;
        isCompanyAdmin: boolean;
        isHiringManager: boolean;
        isPlatformAdmin: boolean;
    }> {
        const response: any = await this.getCurrentUser();
        const payload = response?.data ?? response;
        const user = Array.isArray(payload) ? payload[0] : payload;
        const memberships: Array<{ role?: string }> = user?.memberships ?? [];
        const roles = memberships.map((m) => m.role).filter(Boolean);

        const isRecruiter =
            Boolean(user?.recruiter_id) ||
            roles.includes('recruiter');

        return {
            isRecruiter,
            isCompanyAdmin: roles.includes('company_admin'),
            isHiringManager: roles.includes('hiring_manager'),
            isPlatformAdmin: roles.includes('platform_admin'),
        };
    }

    async updateUser(id: string, data: Record<string, any>) {
        return this.client.updateUser(id, data);
    }

    /**
     * Get companies
     */
    async getCompanies() {
        // Use generic get method for companies endpoint
        return this.client.get('/companies');
    }

    // ===== COMPANY METHODS =====
    
    async getCompany(id: string) {
        return this.client.get(`/companies/${id}`);
    }

    async createCompany(data: {
        name: string;
        website?: string;
        description?: string;
        location?: string;
    }) {
        return this.client.post('/companies', data);
    }

    async updateCompany(id: string, data: {
        name?: string;
        website?: string;
        description?: string;
        location?: string;
    }) {
        return this.client.patch(`/companies/${id}`, data);
    }

    // ===== RECRUITER METHODS =====

    async getRecruiters() {
        return this.client.get('/recruiters');
    }

    async getRecruiterProfile() {
        return this.client.get('/recruiters', { params: { limit: 1 } });
    }

    async getRecruiter(id: string) {
        return this.client.get(`/recruiters/${id}`);
    }

    async createRecruiter(data: {
        name: string;
        email: string;
        phone?: string;
        bio?: string;
    }) {
        return this.client.post('/recruiters', data);
    }

    async updateRecruiter(id: string, data: {
        bio?: string;
        status?: string;
    }) {
        return this.client.patch(`/recruiters/${id}`, data);
    }

    async updateRecruiterProfile(id: string, data: Record<string, any>) {
        return this.client.patch(`/recruiters/${id}`, data);
    }

    async getRecruiterProfile() {
        return this.client.get('/recruiters?limit=1');
    }

    async getAssignments(filters?: { recruiter_id?: string; job_id?: string }) {
        return this.client.get('/assignments', { params: filters });
    }

    async createAssignment(data: {
        job_id: string;
        recruiter_id: string;
    }) {
        return this.client.post('/assignments', data);
    }

    async deleteAssignment(id: string) {
        return this.client.delete(`/assignments/${id}`);
    }

    async getRecruiterCandidates(recruiterId?: string, candidateId?: string) {
        const params: any = {};
        if (recruiterId) params.recruiter_id = recruiterId;
        if (candidateId) params.candidate_id = candidateId;
        return this.client.get('/recruiter-candidates', { params });
    }

    async getRecruiterCandidateRelationship(recruiterId: string, candidateId: string) {
        return this.client.get('/recruiter-candidates', {
            params: {
                recruiter_id: recruiterId,
                candidate_id: candidateId,
                limit: 1,
            },
        });
    }

    async resendInvitation(relationshipId: string) {
        return this.client.post(`/recruiter-candidates/${relationshipId}/resend-invitation`);
    }

    async cancelInvitation(relationshipId: string) {
        return this.client.post(`/recruiter-candidates/${relationshipId}/cancel-invitation`);
    }

    // ===== JOB METHODS =====
    
    /**
     * Get jobs with optional filters
     */
    async getJobs(filters?: { status?: string; search?: string }) {
        return this.client.getJobs(filters);
    }

    /**
     * Get roles (filtered by user context) - alias for getJobs for portal compatibility
     */
    async getRoles(filters?: { 
        status?: string; 
        search?: string; 
        limit?: number; 
        page?: number; 
        job_owner_filter?: 'all' | 'assigned' 
    }) {
        return this.client.getJobs(filters);
    }

    async getJob(id: string, include?: string[]) {
        if (include && include.length > 0) {
            const params = { include: include.join(',') };
            return this.client.get(`/jobs/${id}`, { params });
        }
        return this.client.getJob(id);
    }

    async createJob(data: any) {
        return this.client.post('/jobs', data);
    }

    async updateJob(id: string, data: any) {
        return this.client.patch(`/jobs/${id}`, data);
    }

    async getRecruiterJobs(recruiterId: string) {
        return this.client.getJobs({ recruiter_id: recruiterId });
    }

    // ===== CANDIDATE METHODS =====
    
    async getCandidates(filters?: { search?: string }) {
        return this.client.get('/candidates', { params: filters });
    }

    // ===== APPLICATION METHODS =====
    
    async getApplicationsByJob(jobId: string) {
        return this.client.getApplications({ job_id: jobId });
    }

    async submitCandidate(data: {
        job_id: string;
        full_name: string;
        email: string;
        phone?: string;
        location?: string;
        current_title?: string;
        current_company?: string;
        linkedin_url?: string;
        notes?: string;
    }) {
        return this.client.createApplication(data);
    }

    async updateApplicationStage(id: string, stage: ApplicationStage, notes?: string) {
        return this.client.updateApplication(id, { stage, notes });
    }

    async addApplicationNote(id: string, note: string) {
        return this.client.updateApplication(id, { notes: note });
    }

    async getPendingApplications(options?: { limit?: number }) {
        return this.client.getApplications({
            stage: 'screen',
            limit: options?.limit,
            sort_by: 'created_at',
            sort_order: 'desc'
        });
    }

    async getApplicationFullDetails(applicationId: string, include?: string[]) {
        const includes = include && include.length > 0
            ? include
            : ['candidate', 'job', 'recruiter', 'documents', 'pre_screen_answers', 'audit_log', 'job_requirements'];

        return this.client.getApplication(applicationId, includes as any);
    }

    async recruiterSubmitApplication(applicationId: string, data: { recruiterNotes?: string }) {
        return this.client.updateApplication(applicationId, {
            stage: 'submitted',
            recruiter_notes: data.recruiterNotes
        });
    }

    async requestPreScreen(
        applicationId: string,
        data: {
            company_id: string;
            recruiter_id?: string;
            message?: string;
        }
    ) {
        return this.client.post(`/applications/${applicationId}/pre-screen-request`, data);
    }

    // ===== PLACEMENT METHODS =====
    
    async getPlacements(filters?: { recruiter_id?: string; company_id?: string }) {
        return this.client.get('/placements', { params: filters });
    }

    async createPlacement(data: {
        application_id: string;
        salary: number;
        hired_at?: string;
        fee_percentage?: number;
    }) {
        return this.client.post('/placements', data);
    }

    async getPlacement(id: string) {
        return this.client.get(`/placements/${id}`);
    }

    async getAiReviews(applicationId?: string) {
        if (applicationId) {
            return this.client.getAIReview(applicationId);
        }
        return this.client.get('/ai-reviews');
    }

    // ===== DOCUMENT METHODS =====
    
    async uploadDocument(formData: FormData): Promise<any> {
        return this.client.uploadDocument(formData);
    }

    async getDocument(id: string): Promise<any> {
        return this.client.getDocument(id);
    }

    async getDocumentsByEntity(entityType: string, entityId: string) {
        return this.client.get('/documents', { params: { entity_type: entityType, entity_id: entityId } });
    }

    async deleteDocument(id: string) {
        return this.client.deleteDocument(id);
    }

    // ===== STATS METHODS =====
    
    async getStats(params?: { scope?: string; type?: string; range?: string }): Promise<DashboardStats> {
        return this.client.getDashboardStats(params?.scope);
    }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export a factory function for creating authenticated clients
export function createAuthenticatedClient(token: string): ApiClient {
    return new ApiClient(token);
}
