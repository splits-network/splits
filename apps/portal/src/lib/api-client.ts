// API client for communicating with the backend gateway
// Use internal Docker URL for server-side calls, public URL for client-side
const joinBasePath = (base: string, pathSuffix: string) => {
    let normalizedBase = base.replace(/\/+$/, '');
    const normalizedSuffix = pathSuffix ? (pathSuffix.startsWith('/') ? pathSuffix : `/${pathSuffix}`) : '';

    if (!normalizedSuffix) {
        return normalizedBase;
    }

    if (normalizedSuffix.startsWith('/api')) {
        // Strip any trailing /api or /api/v{X} fragments so we never wind up with /api/api/*
        normalizedBase = normalizedBase.replace(/\/api(?:\/v[0-9]+)?$/, '');
    }

    return `${normalizedBase}${normalizedSuffix}`;
};

const getApiBaseUrl = (pathSuffix: string) => {
    // Server-side (inside Docker container or during build)
    if (typeof window === 'undefined') {
        // If NEXT_PUBLIC_API_GATEWAY_URL is set, use it (for server-side rendering)
        if (process.env.NEXT_PUBLIC_API_GATEWAY_URL) {
            return joinBasePath(process.env.NEXT_PUBLIC_API_GATEWAY_URL, pathSuffix);
        }

        // Check if we're inside a Docker container
        // In Docker, the hostname won't be the local machine name
        const isInDocker = process.env.RUNNING_IN_DOCKER === 'true';

        if (isInDocker) {
            // Use Docker service name for server-side calls inside Docker
            return joinBasePath('http://api-gateway:3000', pathSuffix);
        } else {
            // Running outside Docker (dev mode), use localhost
            return joinBasePath('http://localhost:3000', pathSuffix);
        }
    }

    // Client-side (browser)
    const publicApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    return joinBasePath(publicApiUrl, pathSuffix);
};

const API_V2_BASE_URL = getApiBaseUrl('/api/v2');
const API_V1_BASE_URL = getApiBaseUrl('/api');

console.log(`API Client module - API_V2_BASE_URL: "${API_V2_BASE_URL}", API_V1_BASE_URL: "${API_V1_BASE_URL}"`);

export class ApiClient {
    private baseV2: string;
    private baseV1: string;
    private token?: string;

    constructor(baseUrl: string = API_V2_BASE_URL, token?: string, legacyBaseUrl: string = API_V1_BASE_URL) {
        this.baseV2 = baseUrl;
        this.baseV1 = legacyBaseUrl;
        this.token = token;
        console.log(`API Client constructor - baseV2: "${this.baseV2}", baseV1: "${this.baseV1}"`);
    }

    async request<T>(
        endpoint: string,
        options: RequestInit = {},
        version: 'v1' | 'v2' = 'v2'
    ): Promise<T> {
        const baseUrl = version === 'v2' ? this.baseV2 : this.baseV1;
        const url = `${baseUrl}${endpoint}`;
        console.log(`API Client - constructing URL: baseUrl="${baseUrl}" + endpoint="${endpoint}" = "${url}"`);

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

        return response.json();
    }

    // Generic HTTP methods for admin operations
    async get<T = any>(
        endpoint: string,
        options?: { params?: Record<string, any> },
        version: 'v1' | 'v2' = 'v2'
    ): Promise<T> {
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
        return this.request<T>(url, { method: 'GET' }, version);
    }

    async post<T = any>(
        endpoint: string,
        data?: any,
        version: 'v1' | 'v2' = 'v2'
    ): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        }, version);
    }

    async patch<T = any>(
        endpoint: string,
        data?: any,
        version: 'v1' | 'v2' = 'v2'
    ): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        }, version);
    }

    async delete<T = any>(endpoint: string, version: 'v1' | 'v2' = 'v2'): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' }, version);
    }

    // Identity
    async getCurrentUser() {
        return this.request('/users?limit=1');
    }

    // Get user roles with V2 compatibility
    async getUserRoles() {
        // Get basic user info from V1 identity service
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
            // If V2 recruiter query fails, user is not a recruiter
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

    // Jobs/Roles
    // Unfiltered - returns all jobs (admins only)
    async getJobs(filters?: { status?: string; search?: string }) {
        const params = new URLSearchParams();
        if (filters?.status && filters.status !== 'all') {
            params.append('status', filters.status);
        }
        if (filters?.search) {
            params.append('search', filters.search);
        }
        const query = params.toString();
        return this.request(`/jobs${query ? `?${query}` : ''}`);
    }

    // Filtered by recruiter assignments - preferred for most UI
    async getRoles(filters?: { status?: string; search?: string; limit?: number }) {
        const params = new URLSearchParams();
        if (filters?.status && filters.status !== 'all') {
            params.append('status', filters.status);
        }
        if (filters?.search) {
            params.append('search', filters.search);
        }
        if (filters?.limit) {
            params.append('limit', String(filters.limit));
        }
        const query = params.toString();
        return this.request(`/jobs${query ? `?${query}` : ''}`);
    }

    async getJob(id: string) {
        return this.request(`/jobs/${id}`);
    }

    async createJob(data: any) {
        return this.request('/jobs', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateJob(id: string, data: any) {
        return this.request(`/jobs/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    // Candidates
    async getCandidates(filters?: { search?: string }) {
        const params = new URLSearchParams();
        if (filters?.search) {
            params.append('search', filters.search);
        }
        const query = params.toString();
        console.log('getCandidates - query string:', query);
        return this.get(`/api/v2/candidates${query ? `?${query}` : ''}`);
    }

    // Applications
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
        return this.request('/applications', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateApplicationStage(id: string, stage: string, notes?: string) {
        return this.patch(`/applications/${id}`, { stage, notes });
    }

    async addApplicationNote(id: string, note: string) {
        return this.patch(`/applications/${id}`, { notes: note });
    }

    // Placements
    async getPlacements(filters?: { recruiter_id?: string; company_id?: string }) {
        const params = new URLSearchParams();
        if (filters?.recruiter_id) {
            params.append('recruiter_id', filters.recruiter_id);
        }
        if (filters?.company_id) {
            params.append('company_id', filters.company_id);
        }
        const query = params.toString();
        return this.request(`/placements${query ? `?${query}` : ''}`);
    }

    async createPlacement(data: {
        application_id: string;
        salary: number;
        hired_at?: string;
    }) {
        return this.request('/placements', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Recruiters
    async getRecruiterProfile(recruiterId?: string) {
        if (recruiterId) {
            // If specific recruiter ID provided, use it directly
            return this.get(`/recruiters/${recruiterId}`);
        }

        // For current user, get their recruiter profile via V2 filtered query
        const recruiters = await this.get('/recruiters?limit=1');
        console.log('getRecruiterProfile - recruiters response:', recruiters);
        if (!recruiters?.data || recruiters.data.length === 0) {
            throw new Error('No recruiter profile found for current user');
        }

        // Return the recruiter data in the expected format
        return { data: recruiters.data[0] };
    }

    async updateRecruiterProfile(recruiterId: string, payload: Record<string, any>) {
        if (!recruiterId) {
            throw new Error('Recruiter ID is required to update recruiter profile');
        }
        return this.patch(`/recruiters/${recruiterId}`, payload);
    }

    async getRecruiterJobs(recruiterId: string) {
        return this.get('/jobs', { params: { recruiter_id: recruiterId } });
    }

    // Recruiter Application Review Methods
    async getPendingApplications(options?: { limit?: number }) {
        return this.get('/applications', {
            params: {
                stage: 'screen',
                limit: options?.limit,
                sort_by: 'created_at',
                sort_order: 'desc',
            },
        });
    }

    async getApplicationFullDetails(applicationId: string, include?: string[]) {
        const includes = (include && include.length > 0
            ? include
            : ['candidate', 'job', 'recruiter', 'documents', 'pre_screen_answers', 'audit_log', 'job_requirements']
        )
            .map(part => part.trim())
            .filter(Boolean)
            .join(',');

        return this.get(`/applications/${applicationId}`, {
            params: includes ? { include: includes } : undefined,
        });
    }

    async recruiterSubmitApplication(applicationId: string, data: { recruiterNotes?: string }) {
        return this.patch(`/applications/${applicationId}`, {
            stage: 'submitted',
            recruiter_notes: data.recruiterNotes
        });
    }

    // Subscriptions
    async getMySubscription() {
        const response: any = await this.get('/subscriptions', { params: { limit: 1 } });
        if (Array.isArray(response?.data)) {
            return response;
        }
        return response;
    }

    // Documents
    async uploadDocument(formData: FormData) {
        const url = `${this.baseV2}/documents`;
        const headers: Record<string, string> = {};

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData, // Don't set Content-Type, let browser set it with boundary
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
            params: { entity_type: entityType, entity_id: entityId },
        });
    }

    async deleteDocument(id: string) {
        return this.delete(`/documents/${id}`);
    }

    // Pre-screen requests (company feature)
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

    // Recruiter-Candidate Relationships
    async getRecruiterCandidateRelationship(recruiterId: string, candidateId: string) {
        const response: any = await this.get('/recruiter-candidates', {
            params: {
                recruiter_id: recruiterId,
                candidate_id: candidateId,
                limit: 1,
            },
        });
        console.log('getRecruiterCandidateRelationship - response:', response);
        if (Array.isArray(response?.data) && response.data.length > 0) {
            return { data: response.data[0] };
        }
        return { data: null };
    }

    async getStats(params?: { scope?: string; type?: string; range?: string }) {
        return this.get('/stats', {
            params,
        });
    }

    async updateUser(userId: string, payload: Record<string, any>) {
        if (!userId) {
            throw new Error('User ID is required to update user profile');
        }
        return this.patch(`/users/${userId}`, payload);
    }
}

// Export a singleton instance (for non-authenticated endpoints, if any)
export const apiClient = new ApiClient();

// Export a factory function for creating authenticated clients
export function createAuthenticatedClient(token: string): ApiClient {
    return new ApiClient(API_V2_BASE_URL, token, API_V1_BASE_URL);
}
