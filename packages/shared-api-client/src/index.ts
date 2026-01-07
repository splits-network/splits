/**
 * Unified API Client for Splits Network Frontend Applications
 * 
 * Key Features:
 * - V2 API only (no legacy V1 support)
 * - Automatic response unwrapping ({ data } envelope)
 * - Consistent error handling
 * - Type-safe with shared types
 * - Environment-aware URL construction
 * - Token-based authentication
 */

import type {
    Application,
    ApplicationDTO,
    SubmitCandidateDTO,
    CandidateDTO,
    Job,
    AIReview
} from '@splits-network/shared-types';

// Document type from document service V2
interface Document {
    id: string;
    entity_type: string;
    entity_id: string;
    document_type?: string | null;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    storage_bucket: string;
    uploaded_by?: string | null;
    status?: string;
    processing_status?: string;
    metadata?: Record<string, any> | null;
    created_at: string;
    updated_at: string;
    download_url?: string;
}

// RecruiterRelationship type from network service V2
interface RecruiterRelationship {
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
}

// Dashboard stats type
interface DashboardStats {
    [key: string]: any;
}

export interface ApiClientConfig {
    /** Auth token for API requests */
    authToken?: string;
    /** Base URL override (defaults to environment-based detection) */
    baseUrl?: string;
}

export interface ApiResponse<T> {
    data: T;
    pagination?: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}

export interface ListOptions {
    limit?: number;
    page?: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    [key: string]: any; // For resource-specific filters
}

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public code?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Get the appropriate API base URL based on environment
 */
function getApiBaseUrl(): string {
    // Server-side (SSR/SSG)
    if (typeof window === 'undefined') {
        if (process.env.NEXT_PUBLIC_API_GATEWAY_URL) {
            return normalizeBaseUrl(process.env.NEXT_PUBLIC_API_GATEWAY_URL);
        }
        
        const isInDocker = process.env.RUNNING_IN_DOCKER === 'true';
        return isInDocker 
            ? 'http://api-gateway:3000'
            : 'http://localhost:3000';
    }

    // Client-side (browser)
    const publicApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    return normalizeBaseUrl(publicApiUrl);
}

function normalizeBaseUrl(url: string): string {
    // Remove trailing slashes and any /api suffixes to prevent /api/api paths
    return url.replace(/\/+$/, '').replace(/\/api(?:\/v[0-9]+)?$/, '');
}

/**
 * Unified API Client for Splits Network Frontend Applications
 */
export class SplitsApiClient {
    private baseUrl: string;
    private authToken?: string;

    constructor(config: ApiClientConfig = {}) {
        this.baseUrl = config.baseUrl || getApiBaseUrl();
        this.authToken = config.authToken;
    }

    /**
     * Set auth token for authenticated requests
     */
    setAuthToken(token: string): void {
        this.authToken = token;
    }

    /**
     * Remove auth token
     */
    clearAuthToken(): void {
        this.authToken = undefined;
    }

    /**
     * Make a raw HTTP request to the API
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}/api/v2${endpoint}`;
        
        const headers: Record<string, string> = {
            ...options.headers as Record<string, string>,
        };

        // Set Content-Type for requests with body (except FormData)
        if (options.body && !(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        // Add authorization
        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            await this.handleError(response);
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return undefined as any;
        }

        // Check if response has JSON content
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
            return {} as T;
        }

        const json = await response.json();
        
        // Unwrap API Gateway response envelope
        if (json && typeof json === 'object' && 'data' in json) {
            return json as T; // Keep pagination metadata
        }
        
        return json as T;
    }

    private async handleError(response: Response): Promise<never> {
        let errorMessage = 'An error occurred';
        let errorCode: string | undefined;
        
        try {
            const errorData: any = await response.json();
            if (errorData?.error && typeof errorData.error === 'object') {
                errorMessage = errorData.error.message || errorData.error.code || errorMessage;
                errorCode = errorData.error.code;
            } else {
                errorMessage = errorData?.message || errorData?.error || errorMessage;
                errorCode = typeof errorData?.error === 'string' ? errorData.error : undefined;
            }
        } catch {
            errorMessage = response.statusText || errorMessage;
        }
        
        throw new ApiError(errorMessage, response.status, errorCode);
    }

    /**
     * HTTP GET request with query parameters
     */
 async get<T = any>(
    endpoint: string, 
    params?: Record<string, any>
): Promise<T> {
    let url = endpoint;
    if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                // JSON stringify objects (like filters) but keep primitives as strings
                if (typeof value === 'object' && value !== null) {
                    searchParams.append(key, JSON.stringify(value));
                } else {
                    searchParams.append(key, String(value));
                }
            }
        });
        const query = searchParams.toString();
        if (query) {
            url = `${endpoint}?${query}`;
        }
    }
    return this.request<T>(url, { method: 'GET' });
}

    /**
     * HTTP POST request
     */
    async post<T = any>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data instanceof FormData ? data : JSON.stringify(data),
        });
    }

    /**
     * HTTP PATCH request
     */
    async patch<T = any>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * HTTP DELETE request
     */
    async delete<T = any>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

}

/**
 * Create authenticated API client instance
 */
export function createApiClient(authToken?: string): SplitsApiClient {
    return new SplitsApiClient({ authToken });
}

/**
 * Default export for convenient imports
 */
export default SplitsApiClient;