/**
 * API Client for Applicant Network
 * Communicates with backend services via API Gateway
 */

import { normalizeDocument, normalizeDocuments, type Document } from './document-utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

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

async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {},
    authToken?: string | null
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
        ...options.headers as Record<string, string>,
    };
    
    // Only set Content-Type for requests with a body
    if (options.body) {
        headers['Content-Type'] = 'application/json';
    }
    
    // Add auth token if provided
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorMessage = 'An error occurred';
        let errorCode: string | undefined;
        
        try {
            const errorData = await response.json();
            // Handle different error response formats
            if (errorData.error && typeof errorData.error === 'object') {
                // Error is an object with code/message (API Gateway format)
                errorMessage = errorData.error.message || errorData.error.code || errorMessage;
                errorCode = errorData.error.code;
            } else {
                // Error is a simple string or message field
                errorMessage = errorData.message || errorData.error || errorMessage;
                errorCode = typeof errorData.error === 'string' ? errorData.error : undefined;
            }
        } catch {
            // If response is not JSON, use status text
            errorMessage = response.statusText || errorMessage;
        }
        
        throw new ApiError(errorMessage, response.status, errorCode);
    }

    // Handle 204 No Content - return empty object
    if (response.status === 204) {
        return {} as T;
    }

    // Check if response has content before parsing JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        // For non-JSON responses, return empty object
        return {} as T;
    }

    const json = await response.json();
    
    // API Gateway wraps responses in { data: ... }
    // Unwrap if the response has a data property
    if (json && typeof json === 'object' && 'data' in json) {
        return json.data as T;
    }
    
    return json as T;
}

// Invitation API
export interface InvitationDetails {
    relationship_id: string;
    recruiter_id: string;
    candidate_id: string;
    invited_at: string;
    expires_at: string;
    status: 'pending';
    recruiter_name?: string;
    recruiter_email?: string;
    recruiter_bio?: string;
}

export interface RecruiterDetails {
    id: string;
    user_id: string;
    name?: string;
    email?: string;
    bio?: string;
    status: string;
}

export interface CandidateDetails {
    id: string;
    full_name: string;
    email: string;
}

export interface UserDetails {
    id: string;
    name: string;
    email: string;
}

export async function getInvitationDetails(token: string, authToken?: string | null): Promise<InvitationDetails> {
    return fetchApi<InvitationDetails>(`/api/v2/recruiter-candidates/invitations/${token}`, {}, authToken);
}

export async function acceptInvitation(token: string, authToken?: string | null): Promise<{ success: boolean; message: string }> {
    return fetchApi<{ success: boolean; message: string }>(
        `/api/v2/recruiter-candidates/invitations/${token}/accept`,
        {
            method: 'POST',
            body: JSON.stringify({}),
        },
        authToken
    );
}

export async function declineInvitation(
    token: string,
    reason?: string,
    authToken?: string | null
): Promise<{ success: boolean; message: string }> {
    return fetchApi<{ success: boolean; message: string }>(
        `/api/v2/recruiter-candidates/invitations/${token}/decline`,
        {
            method: 'POST',
            body: JSON.stringify({ reason }),
        },
        authToken
    );
}

export async function getRecruiterDetails(recruiterId: string, authToken?: string | null): Promise<RecruiterDetails> {
    return fetchApi<RecruiterDetails>(`/api/v2/recruiters/${recruiterId}`, {}, authToken);
}

export async function getCandidateDetails(candidateId: string, authToken?: string | null): Promise<CandidateDetails> {
    return fetchApi<CandidateDetails>(`/api/v2/candidates/${candidateId}`, {}, authToken);
}

export async function getUserDetails(userId: string, authToken?: string | null): Promise<UserDetails> {
    return fetchApi<UserDetails>(`/api/v2/users/${userId}`, {}, authToken);
}

// Dashboard API
export interface DashboardStats {
    applications: number;
    interviews: number;
    offers: number;
    active_relationships: number;
}

export interface RecentApplication {
    id: string;
    job_id: string;
    job_title: string;
    company: string;
    status: string;
    applied_at: string;
}

export interface Application {
    id: string;
    job_id: string;
    job_title: string;
    company: string;
    location: string;
    status: string;
    stage: string;
    applied_at: string;
    updated_at: string;
    notes?: string;
}

export async function getDashboardStats(authToken: string): Promise<DashboardStats> {
    return fetchApi<DashboardStats>('/api/v2/candidate-dashboard/stats', {}, authToken);
}

export async function getRecentApplications(authToken: string): Promise<RecentApplication[]> {
    return fetchApi<RecentApplication[]>('/api/v2/candidate-dashboard/recent-applications', {}, authToken);
}

export async function getApplications(authToken: string): Promise<Application[]> {
    return fetchApi<Application[]>('/api/v2/applications', {}, authToken);
}

export type { Document } from './document-utils';

// Documents API
export async function getMyDocuments(authToken: string): Promise<Document[]> {
    const docs = await fetchApi<any[]>('/api/v2/documents', {}, authToken);
    return normalizeDocuments(docs);
}

export async function uploadDocument(formData: FormData, authToken: string): Promise<Document> {
    const url = `${API_BASE_URL}/api/v2/documents`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
    });

    if (!response.ok) {
        let errorMessage = 'Failed to upload document';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
            errorMessage = response.statusText || errorMessage;
        }
        throw new ApiError(errorMessage, response.status);
    }

    const json = await response.json();
    const payload = json.data || json;
    return normalizeDocument(payload);
}

export async function deleteDocument(documentId: string, authToken: string): Promise<void> {
    await fetchApi<void>(`/api/v2/documents/${documentId}`, {
        method: 'DELETE',
    }, authToken);
}

export async function getDocumentUrl(documentId: string, authToken: string): Promise<string> {
    const doc = await fetchApi<any>(`/api/v2/documents/${documentId}`, {}, authToken);
    const normalized = normalizeDocument(doc);
    return normalized.download_url || '';
}

export async function getJobPreScreenQuestions(jobId: string, authToken: string) {
    return fetchApi<any[]>(
        `/api/v2/job-pre-screen-questions?job_id=${encodeURIComponent(jobId)}`,
        {},
        authToken
    );
}

export async function getJobPreScreenAnswers(applicationId: string, authToken: string) {
    return fetchApi<any[]>(
        `/api/v2/job-pre-screen-answers?application_id=${encodeURIComponent(applicationId)}`,
        {},
        authToken
    );
}

export async function getJobRequirements(jobId: string, authToken: string) {
    return fetchApi<any[]>(
        `/api/v2/job-requirements?job_id=${encodeURIComponent(jobId)}`,
        {},
        authToken
    );
}

export async function saveJobPreScreenAnswers(
    applicationId: string,
    answers: Record<string, any>,
    authToken: string
) {
    const payload = Object.entries(answers).map(([question_id, answer]) => ({
        application_id: applicationId,
        question_id,
        answer,
    }));

    if (payload.length === 0) {
        return [];
    }

    return fetchApi(
        '/api/v2/job-pre-screen-answers',
        {
            method: 'POST',
            body: JSON.stringify({ answers: payload }),
        },
        authToken
    );
}

export async function updateApplication(
    applicationId: string,
    updates: Record<string, any>,
    authToken: string
) {
    return fetchApi(
        `/api/v2/applications/${applicationId}`,
        {
            method: 'PATCH',
            body: JSON.stringify(updates),
        },
        authToken
    );
}

// Candidate Profile API
export interface CandidateProfile {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    location?: string;
    current_title?: string;
    current_company?: string;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
    bio?: string;
    skills?: string;
    created_at: string;
    updated_at: string;
}

export async function getMyCandidateProfile(authToken: string): Promise<CandidateProfile | null> {
    try {
        const candidates = await fetchApi<CandidateProfile[]>(
            '/api/v2/candidates?limit=1',
            {},
            authToken
        );
        if (!candidates || candidates.length === 0) {
            return null;
        }
        return candidates[0];
    } catch (error: any) {
        if (error instanceof ApiError && error.status === 404) {
            return null;
        }
        throw error;
    }
}

export interface CurrentUserProfile {
    id: string;
    email: string;
    full_name?: string | null;
    avatar_url?: string | null;
    clerk_user_id?: string;
    roles?: string[];
    organization_ids?: string[];
    candidate_id?: string | null;
    recruiter_id?: string | null;
    is_platform_admin?: boolean;
}

export async function getCurrentUser(authToken: string): Promise<CurrentUserProfile> {
    const users = await fetchApi<CurrentUserProfile[]>('/api/v2/users?limit=1', {}, authToken);
    if (!users || users.length === 0) {
        throw new ApiError('User not found', 404);
    }
    return users[0];
}

// Recruiter Relationships API
export interface RecruiterRelationship {
    id: string;
    recruiter_id: string;
    recruiter_name: string;
    recruiter_email: string;
    recruiter_bio?: string;
    recruiter_status: string;
    relationship_start_date: string;
    relationship_end_date: string;
    status: 'active' | 'expired' | 'terminated';
    consent_given: boolean;
    consent_given_at?: string;
    created_at: string;
    days_until_expiry?: number;
}

export interface MyRecruitersResponse {
    active: RecruiterRelationship[];
    expired: RecruiterRelationship[];
    terminated: RecruiterRelationship[];
}

export async function getMyRecruiters(authToken: string): Promise<MyRecruitersResponse> {
    const response = await fetchApi<{ data?: any[] } | any[]>(
        '/api/v2/recruiter-candidates?limit=250',
        {},
        authToken
    );

    console.log('Raw recruiter relationships response:', response);

    const relationships = Array.isArray(response) ? response : response?.data || [];

    const mapped: RecruiterRelationship[] = relationships.map((rel: any) => {
        const recruiter = rel.recruiter || {};
        const startDate =
            rel.relationship_start_date ||
            rel.relationship_start ||
            rel.created_at ||
            new Date().toISOString();
        const endDate =
            rel.relationship_end_date ||
            rel.relationship_end ||
            rel.relationship_expires_at ||
            startDate;

        const daysUntilExpiry =
            rel.status === 'active' && endDate
                ? Math.max(
                      0,
                      Math.ceil(
                          (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      )
                  )
                : undefined;

        return {
            id: rel.id,
            recruiter_id: rel.recruiter_id,
            recruiter_name: recruiter.name || rel.recruiter_name || 'Unknown Recruiter',
            recruiter_email: recruiter.email || rel.recruiter_email || '',
            recruiter_bio: recruiter.bio || rel.recruiter_bio || '',
            recruiter_status: recruiter.status || rel.recruiter_status || '',
            relationship_start_date: startDate,
            relationship_end_date: endDate,
            status: rel.status || 'active',
            consent_given: Boolean(rel.consent_given),
            consent_given_at: rel.consent_given_at || undefined,
            created_at: rel.created_at || startDate,
            days_until_expiry: daysUntilExpiry,
        };
    });

    const grouped: MyRecruitersResponse = {
        active: [],
        expired: [],
        terminated: [],
    };

    for (const relationship of mapped) {
        if (relationship.status === 'active') {
            grouped.active.push(relationship);
        } else if (relationship.status === 'expired') {
            grouped.expired.push(relationship);
        } else {
            grouped.terminated.push(relationship);
        }
    }

    grouped.active.sort((a, b) => {
        const daysA = typeof a.days_until_expiry === 'number' ? a.days_until_expiry : Infinity;
        const daysB = typeof b.days_until_expiry === 'number' ? b.days_until_expiry : Infinity;
        return daysA - daysB;
    });

    const sortByStartDateDesc = (a: RecruiterRelationship, b: RecruiterRelationship) =>
        new Date(b.relationship_start_date).getTime() - new Date(a.relationship_start_date).getTime();

    grouped.expired.sort(sortByStartDateDesc);
    grouped.terminated.sort(sortByStartDateDesc);

    return grouped;
}

export async function getMyProfile(authToken: string): Promise<CandidateProfile | null> {
    return getMyCandidateProfile(authToken);
}

export async function createMyProfile(authToken: string, profileData: Partial<CandidateProfile>): Promise<CandidateProfile> {
    // Create a candidate profile for the current user
    return fetchApi<CandidateProfile>('/api/v2/candidates', {
        method: 'POST',
        body: JSON.stringify({
            first_name: profileData.full_name?.split(' ')[0] || '',
            last_name: profileData.full_name?.split(' ').slice(1).join(' ') || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
            location: profileData.location || '',
            current_title: profileData.current_title || '',
            current_company: profileData.current_company || '',
            linkedin_url: profileData.linkedin_url || '',
            github_url: profileData.github_url || '',
            portfolio_url: profileData.portfolio_url || '',
            bio: profileData.bio || '',
            skills: profileData.skills || '',
            status: 'active',
        }),
    }, authToken);
}

export async function updateMyProfile(authToken: string, updates: Partial<CandidateProfile>): Promise<CandidateProfile> {
    const profile = await getMyCandidateProfile(authToken);
    if (!profile) {
        // If no profile exists, create it instead of updating
        return createMyProfile(authToken, updates);
    }

    return fetchApi<CandidateProfile>(`/api/v2/candidates/${profile.id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
    }, authToken);
}
