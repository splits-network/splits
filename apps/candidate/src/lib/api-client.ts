// API client for communicating with the backend gateway
// Use internal Docker URL for server-side calls, public URL for client-side
import { normalizeDocuments } from './document-utils';

const getApiBaseUrl = () => {
  // Server-side (inside Docker container or during build)
  if (typeof window === 'undefined') {
    // If NEXT_PUBLIC_API_GATEWAY_URL is set, use it (for server-side rendering)
    if (process.env.NEXT_PUBLIC_API_GATEWAY_URL) {
      return `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api`;
    }
    
    // Running outside Docker (dev mode), use localhost
    return 'http://localhost:3000/api';
  }
  
  // Client-side (browser)
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
};

const API_BASE_URL = getApiBaseUrl();


interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', token });
  }

  async post<T>(
    endpoint: string,
    data: unknown,
    token?: string
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  }

  async put<T>(
    endpoint: string,
    data: unknown,
    token?: string
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    });
  }

  async patch<T>(
    endpoint: string,
    data: unknown,
    token?: string
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    });
  }

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', token });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Application API methods
export async function submitApplication(data: {
  job_id: string;
  document_ids: string[];
  primary_resume_id: string;
  pre_screen_answers?: Array<{ question_id: string; answer: any }>;
  notes?: string;
  stage?: string;
}, token: string) {
  return apiClient.post('/v2/applications', data, token);
}

export async function getMyApplications(token: string) {
  return apiClient.get('/v2/applications', token);
}

export async function getApplicationById(applicationId: string, token: string) {
  return apiClient.get(`/v2/applications/${applicationId}`, token);
}

export async function getApplicationDetails(applicationId: string, token: string) {
  return apiClient.get(`/v2/applications/${applicationId}`, token);
}

export async function withdrawApplication(applicationId: string, reason: string | undefined, token: string) {
  return apiClient.patch(`/v2/applications/${applicationId}`, {
    stage: 'withdrawn',
    notes: reason || 'Candidate withdrew application',
  }, token);
}

// Job API methods
export async function getJob(jobId: string, token: string) {
  return apiClient.get(`/v2/jobs/${jobId}`, token);
}

export async function getPreScreenQuestions(jobId: string, token: string) {
  return apiClient.get(`/v2/job-pre-screen-questions?job_id=${jobId}`, token);
}

// Document API methods
export async function getMyDocuments(token: string) {
  const response = await apiClient.get('/v2/documents', token);
  const docs = (response as any).data || response;
  return normalizeDocuments(docs);
}
