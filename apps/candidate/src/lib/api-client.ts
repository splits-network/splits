/**
 * Candidate App API Client
 *
 * Mirrors the portal client's structure so both apps share the same
 * SplitsApiClient-powered surface area.
 */

import { SplitsApiClient, type ApiResponse } from '@splits-network/shared-api-client';
import type { ApplicationStage } from '@splits-network/shared-types';
import { normalizeDocuments } from './document-utils';

type SubmitApplicationPayload = {
    job_id: string;
    document_ids: string[];
    primary_resume_id: string;
    pre_screen_answers?: Array<{ question_id: string; answer: any }>;
    notes?: string;
    stage?: ApplicationStage;
};

type RecruiterRelationship = {
    id: string;
    candidate_id: string;
    recruiter_user_id: string;
    status: string;
    invitation_status?: string;
    recruiter_name?: string;
    recruiter_email?: string;
    recruiter_bio?: string;
    recruiter_status?: string;
    created_at: string;
    updated_at: string;
};

/**
 * Candidate API client - wrapper around the shared Splits client
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
     * Clear authentication token
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

    // ===== CANDIDATE METHODS =====

    async submitApplication(data: SubmitApplicationPayload) {
        return this.client.createApplication(data);
    }

    async getMyApplications() {
        return this.client.getApplications();
    }

    async getApplicationById(applicationId: string) {
        return this.client.getApplication(applicationId);
    }

    async getApplicationDetails(applicationId: string, include?: string[]) {
        const includes = include?.length ? include : ['job', 'documents', 'ai_review'];
        return this.client.getApplication(applicationId, includes as any);
    }

    async withdrawApplication(applicationId: string, reason?: string) {
        return this.client.updateApplication(applicationId, {
            stage: 'withdrawn',
            notes: reason || 'Candidate withdrew application',
        });
    }

    async updateApplication(applicationId: string, updates: Record<string, any>) {
        return this.client.updateApplication(applicationId, updates);
    }

    async getJob(jobId: string, include?: string[]) {
        if (include?.length) {
            return this.client.get(`/jobs/${jobId}`, { include: include.join(',') });
        }
        return this.client.getJob(jobId);
    }

    async getPreScreenQuestions(jobId: string) {
        return this.client.getJobPreScreenQuestions(jobId);
    }

    async getMyDocuments() {
        const response = await this.client.getMyDocuments();
        const docs = response.data || [];
        return normalizeDocuments(docs);
    }

    async getMyProfile() {
        return this.client.getMyCandidateProfile();
    }

    async getMyRecruiters(options?: Record<string, any>): Promise<ApiResponse<RecruiterRelationship[]>> {
        return this.client.getMyRecruiterRelationships(options);
    }

    async getJobs(filters?: {
        search?: string;
        location?: string;
        employment_type?: string;
        limit?: number;
        page?: number;
    }) {
        return this.client.getJobs(filters);
    }
}

// ===== EXPORTS =====

export const apiClient = new ApiClient();

export function createAuthenticatedClient(token: string): ApiClient {
    return new ApiClient(token);
}

function withToken<T>(token: string, handler: (client: ApiClient) => Promise<T>): Promise<T> {
    return handler(createAuthenticatedClient(token));
}

// ===== TOKENED HELPERS (BACKWARDS COMPATIBILITY) =====

export async function submitApplication(data: SubmitApplicationPayload, token: string) {
    return withToken(token, (client) => client.submitApplication(data));
}

export async function getMyApplications(token: string) {
    return withToken(token, (client) => client.getMyApplications());
}

export async function getApplicationById(applicationId: string, token: string) {
    return withToken(token, (client) => client.getApplicationById(applicationId));
}

export async function getApplicationDetails(applicationId: string, token: string, include?: string[]) {
    return withToken(token, (client) => client.getApplicationDetails(applicationId, include));
}

export async function withdrawApplication(applicationId: string, reason: string | undefined, token: string) {
    return withToken(token, (client) => client.withdrawApplication(applicationId, reason));
}

export async function updateApplication(applicationId: string, updates: Record<string, any>, token: string) {
    return withToken(token, (client) => client.updateApplication(applicationId, updates));
}

export async function getJob(jobId: string, token: string) {
    return withToken(token, (client) => client.getJob(jobId));
}

export async function getPreScreenQuestions(jobId: string, token: string) {
    return withToken(token, (client) => client.getPreScreenQuestions(jobId));
}

export async function getMyDocuments(token: string) {
    return withToken(token, (client) => client.getMyDocuments());
}

export async function getMyProfile(token: string) {
    return withToken(token, (client) => client.getMyProfile());
}

export async function getMyRecruiters(token: string) {
    return withToken(token, (client) => client.getMyRecruiters());
}
