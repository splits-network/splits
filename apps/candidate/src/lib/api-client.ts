/**
 * Candidate App API Client
 * 
 * This module provides a convenient wrapper around the shared API client
 * for candidate-specific operations. It handles authentication and provides
 * typed methods for candidate-related API calls.
 */

import { SplitsApiClient, type ApiResponse } from '@splits-network/shared-api-client';
import { normalizeDocuments } from './document-utils';

// Get the API base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Make public API requests without authentication
 */
async function publicFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  return response.json();
}

let globalApiClient: SplitsApiClient;

/**
 * Get the shared API client instance
 */
function getApiClient(): SplitsApiClient {
  if (!globalApiClient) {
    globalApiClient = new SplitsApiClient();
  }
  return globalApiClient;
}

/**
 * Create an authenticated API client with the provided token
 */
export function createAuthenticatedClient(token: string): SplitsApiClient {
  const client = new SplitsApiClient();
  client.setAuthToken(token);
  return client;
}

// === CANDIDATE-SPECIFIC API METHODS ===

export async function submitApplication(data: {
  job_id: string;
  document_ids: string[];
  primary_resume_id: string;
  pre_screen_answers?: Array<{ question_id: string; answer: any }>;
  notes?: string;
  stage?: string;
}, token: string) {
  const client = createAuthenticatedClient(token);
  const response = await client.createApplication(data);
  return response.data;
}

export async function getMyApplications(token: string) {
  const client = createAuthenticatedClient(token);
  const response = await client.getApplications();
  return response.data;
}

export async function getApplicationById(applicationId: string, token: string) {
  const client = createAuthenticatedClient(token);
  const response = await client.getApplication(applicationId);
  return response.data;
}

export async function getApplicationDetails(applicationId: string, token: string) {
  const client = createAuthenticatedClient(token);
  const response = await client.getApplication(applicationId, ['job', 'documents', 'ai_review']);
  return response.data;
}

export async function withdrawApplication(applicationId: string, reason: string | undefined, token: string) {
  const client = createAuthenticatedClient(token);
  const response = await client.updateApplication(applicationId, {
    stage: 'withdrawn',
    notes: reason || 'Candidate withdrew application',
  });
  return response.data;
}

export async function updateApplication(applicationId: string, updates: any, token: string) {
  const client = createAuthenticatedClient(token);
  const response = await client.updateApplication(applicationId, updates);
  return response.data;
}

export async function getJob(jobId: string, token: string) {
  const client = createAuthenticatedClient(token);
  const response = await client.getJob(jobId);
  return response.data;
}

export async function getPreScreenQuestions(jobId: string, token: string) {
  const client = createAuthenticatedClient(token);
  const response = await client.getJobPreScreenQuestions(jobId);
  return response.data;
}

export async function getMyDocuments(token: string) {
  const client = createAuthenticatedClient(token);
  const response = await client.getMyDocuments();
  const docs = response.data || [];
  return normalizeDocuments(docs);
}

export async function getMyProfile(token: string) {
  const client = createAuthenticatedClient(token);
  const response = await client.getMyCandidate();
  return response.data;
}

export async function getMyRecruiters(token: string) {
  const client = createAuthenticatedClient(token);
  const response = await client.getMyRecruiterCandidates();
  return response.data;
}

// === PUBLIC JOB METHODS ===

export async function getJobs(filters?: {
  search?: string;
  location?: string;
  employment_type?: string;
  limit?: number;
  offset?: number;
  page?: number;
}) {
        return this.client.getJobs(filters);
}

// === MODERN API (use these in new code) ===

/**
 * Get the shared API client (for use in modern code)
 */
export { getApiClient };

/**
 * API client instance for jobs list and other public endpoints
 */
export const apiClient = {
  async get<T = any>(endpoint: string, options?: { params?: Record<string, any> }): Promise<T> {
    // Handle jobs endpoints as public requests
    if (endpoint.includes('/v2/jobs')) {
      // Extract query params from endpoint URL if present
      const url = new URL(endpoint, 'http://example.com');
      const urlParams = Object.fromEntries(url.searchParams.entries());
      
      // Merge URL params with provided params
      const allParams = { ...urlParams, ...options?.params };
      
      // Convert offset to page for pagination
      if (allParams.offset && allParams.limit) {
        const offset = parseInt(allParams.offset);
        const limit = parseInt(allParams.limit);
        allParams.page = Math.floor(offset / limit) + 1;
        delete allParams.offset;
      }
      
      const response = await getJobs(allParams);
      return response as T;
    }
    
    // For other endpoints, use authenticated client
    const client = getApiClient();
    const response = await client.get(endpoint, options?.params);
    return response as T;
  }
};
