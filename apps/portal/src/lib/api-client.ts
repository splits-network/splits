// Portal API Client - Direct V2 Implementation
// Temporary solution while shared package types are being fixed

const getApiBaseUrl = () => {
    // Server-side (inside Docker container or during build)
    if (typeof window === 'undefined') {
        // If NEXT_PUBLIC_API_GATEWAY_URL is set, use it (for server-side rendering)
        if (process.env.NEXT_PUBLIC_API_GATEWAY_URL) {
            return process.env.NEXT_PUBLIC_API_GATEWAY_URL.replace(/\/+$/, '') + '/api/v2';
        }

        // Check if we're inside a Docker container
        const isInDocker = process.env.RUNNING_IN_DOCKER === 'true';

        if (isInDocker) {
            return 'http://api-gateway:3000/api/v2';
        } else {
            return 'http://localhost:3000/api/v2';
        }
    }

    // Client-side (browser)
    const publicApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    return publicApiUrl.replace(/\/+$/, '') + '/api/v2';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Portal API client - Direct V2 implementation
 */
export class ApiClient {
    private baseUrl: string;
    private token?: string;

    constructor(token?: string) {
        this.baseUrl = API_BASE_URL;
        this.token = token;
    }

    /**
     * Set authentication token
     */
    setToken(token: string): void {
        this.token = token;
    }

    /**
     * Remove authentication token
     */
    clearToken(): void {
        this.token = undefined;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers as Record<string, string>,
        };

        // Add authorization header if token is available
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        // Handle 204 No Content responses
        if (response.status === 204) {
            return undefined as any;
        }

        const result = await response.json();
        
        // Return the full result (V2 APIs return {data, pagination} envelope)
        return result;
    }

    // Generic HTTP methods
    async get<T = any>(endpoint: string, options?: { params?: Record<string, any> }): Promise<T> {
        let url = endpoint;
        if (options?.params) {
            const params = new URLSearchParams();
            Object.entries(options.params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
            const query = params.toString();
            if (query) {
                url = `${endpoint}?${query}`;
            }
        }
        return this.request<T>(url, { method: 'GET' });
    }

    async post<T = any>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async patch<T = any>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T = any>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    // ===== ROLE AND USER METHODS =====
    
    /**
     * Get current user information
     */
    async getCurrentUser() {
        return this.request('/users?limit=1');
    }

    /**
     * Get user roles with recruiter status checking
     */
    async getUserRoles() {
        // Get basic user info from identity service
        const userResponse = await this.getCurrentUser();
        let user: any = {};
        
        if (userResponse && typeof userResponse === 'object' && userResponse !== null) {
            if ('data' in userResponse) {
                const responseData = (userResponse as any).data;
                user = Array.isArray(responseData) ? responseData[0] || {} : responseData || {};
            } else {
                user = userResponse;
            }
        }
        
        const roles: string[] = Array.isArray(user.roles) ? user.roles : [];

        // Check if user is a recruiter using V2 network service
        let isRecruiter = false;
        try {
            const recruitersResponse = await this.get('/recruiters?limit=1');
            console.log('API Client - recruitersResponse:', recruitersResponse);
            isRecruiter = Boolean(recruitersResponse?.data && recruitersResponse.data.length > 0);
            console.log('API Client - isRecruiter:', isRecruiter, 'data length:', recruitersResponse?.data?.length);
        } catch (error) {
            console.error('API Client - recruiter check error:', error);
            isRecruiter = false;
        }

        return {
            isRecruiter,
            isCompanyAdmin: roles.includes('company_admin'),
            isHiringManager: roles.includes('hiring_manager'),
            isPlatformAdmin: Boolean(user.is_platform_admin || roles.includes('platform_admin')),
            user
        };
    }

    async updateUser(userId: string, payload: Record<string, any>) {
        if (!userId) {
            throw new Error('User ID is required to update user profile');
        }
        return this.patch(`/users/${userId}`, payload);
    }

    // ===== JOB/ROLE METHODS =====
    
    /**
     * Get jobs (unfiltered - admin access)
     */
    async getJobs(filters?: { status?: string; search?: string }) {
        const params: any = {};
        if (filters?.status && filters.status !== 'all') {
            params.status = filters.status;
        }
        if (filters?.search) {
            params.search = filters.search;
        }
        return this.get('/jobs', { params });
    }

    /**
     * Get roles (filtered by user context)
     */
    async getRoles(filters?: { 
        status?: string; 
        search?: string; 
        limit?: number; 
        page?: number; 
        job_owner_filter?: 'all' | 'assigned' 
    }) {
        const params: any = {};
        if (filters?.status && filters.status !== 'all') {
            params.status = filters.status;
        }
        if (filters?.search) {
            params.search = filters.search;
        }
        if (filters?.limit) {
            params.limit = filters.limit;
        }
        if (filters?.page) {
            params.page = filters.page;
        }
        if (filters?.job_owner_filter) {
            params.job_owner_filter = filters.job_owner_filter;
        }
        return this.get('/jobs', { params });
    }

    async getJob(id: string, include?: string[]) {
        const params: any = {};
        if (include && include.length > 0) {
            params.include = include.join(',');
        }
        return this.get(`/jobs/${id}`, { params });
    }

    async createJob(data: any) {
        return this.post('/jobs', data);
    }

    async updateJob(id: string, data: any) {
        return this.patch(`/jobs/${id}`, data);
    }

    async getRecruiterJobs(recruiterId: string) {
        return this.get('/jobs', { params: { recruiter_id: recruiterId } });
    }

    // ===== CANDIDATE METHODS =====
    
    async getCandidates(filters?: { search?: string }) {
        const params: any = {};
        if (filters?.search) {
            params.search = filters.search;
        }
        console.log('getCandidates - query params:', params);
        return this.get('/candidates', { params });
    }

    // ===== APPLICATION METHODS =====
    
    async getApplicationsByJob(jobId: string) {
        return this.get('/applications', { params: { job_id: jobId } });
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
        return this.post('/applications', data);
    }

    async updateApplicationStage(id: string, stage: string, notes?: string) {
        return this.patch(`/applications/${id}`, { stage, notes });
    }

    async addApplicationNote(id: string, note: string) {
        return this.patch(`/applications/${id}`, { notes: note });
    }

    async getPendingApplications(options?: { limit?: number }) {
        return this.get('/applications', {
            params: {
                stage: 'screen',
                limit: options?.limit,
                sort_by: 'created_at',
                sort_order: 'desc'
            }
        });
    }

    async getApplicationFullDetails(applicationId: string, include?: string[]) {
        const includes = include && include.length > 0
            ? include
            : ['candidate', 'job', 'recruiter', 'documents', 'pre_screen_answers', 'audit_log', 'job_requirements'];

        return this.get(`/applications/${applicationId}`, {
            params: includes.length > 0 ? { include: includes.join(',') } : undefined
        });
    }

    async recruiterSubmitApplication(applicationId: string, data: { recruiterNotes?: string }) {
        return this.patch(`/applications/${applicationId}`, {
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
        return this.patch(`/applications/${applicationId}`, {
            pre_screen_request: data
        });
    }

    // ===== PLACEMENT METHODS =====
    
    async getPlacements(filters?: { recruiter_id?: string; company_id?: string }) {
        return this.get('/placements', { params: filters });
    }

    async createPlacement(data: {
        application_id: string;
        salary: number;
        hired_at?: string;
    }) {
        return this.post('/placements', data);
    }

    // ===== RECRUITER METHODS =====
    
    async getRecruiterProfile(recruiterId?: string) {
        if (recruiterId) {
            return this.get(`/recruiters/${recruiterId}`);
        }

        // For current user, get their recruiter profile via filtered query
        const recruiters = await this.get('/recruiters?limit=1');
        console.log('getRecruiterProfile - recruiters response:', recruiters);
        if (!recruiters?.data || recruiters.data.length === 0) {
            throw new Error('No recruiter profile found for current user');
        }

        return { data: recruiters.data[0] };
    }

    async updateRecruiterProfile(recruiterId: string, payload: Record<string, any>) {
        if (!recruiterId) {
            throw new Error('Recruiter ID is required to update recruiter profile');
        }
        return this.patch(`/recruiters/${recruiterId}`, payload);
    }

    // ===== RECRUITER-CANDIDATE RELATIONSHIP METHODS =====
    
    async getRecruiterCandidateRelationship(recruiterId: string, candidateId: string) {
        const response = await this.get('/recruiter-candidates', {
            params: {
                recruiter_id: recruiterId,
                candidate_id: candidateId,
                limit: 1
            }
        });
        console.log('getRecruiterCandidateRelationship - response:', response);
        if (Array.isArray(response?.data) && response.data.length > 0) {
            return { data: response.data[0] };
        }
        return { data: null };
    }

    // ===== SUBSCRIPTION METHODS =====
    
    async getMySubscription() {
        const response = await this.get('/subscriptions', { params: { limit: 1 } });
        if (Array.isArray(response?.data)) {
            return response;
        }
        return response;
    }

    // ===== DOCUMENT METHODS =====
    
    async uploadDocument(formData: FormData) {
        const url = `${this.baseUrl}/documents`;
        const headers: Record<string, string> = {};

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Upload failed' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        return response.json();
    }

    async getDocument(id: string) {
        return this.get(`/documents/${id}`);
    }

    async getDocumentsByEntity(entityType: string, entityId: string) {
        return this.get('/documents', {
            params: { entity_type: entityType, entity_id: entityId }
        });
    }

    async deleteDocument(id: string) {
        return this.delete(`/documents/${id}`);
    }

    // ===== STATS METHODS =====
    
    async getStats(params?: { scope?: string; type?: string; range?: string }) {
        return this.get('/stats', { params });
    }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export a factory function for creating authenticated clients
export function createAuthenticatedClient(token: string): ApiClient {
    return new ApiClient(token);
}
