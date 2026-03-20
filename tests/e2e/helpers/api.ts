/**
 * Direct API helpers for test setup, teardown, and verification.
 * Calls the API gateway directly (localhost:3000) with auth tokens.
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

interface RequestOptions {
  token?: string;
  params?: Record<string, string>;
}

async function apiRequest<T = any>(
  method: string,
  endpoint: string,
  body?: any,
  options: RequestOptions = {}
): Promise<T> {
  const url = new URL(`/api/v2${endpoint}`, API_URL);
  if (options.params) {
    Object.entries(options.params).forEach(([k, v]) =>
      url.searchParams.set(k, v)
    );
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${method} ${endpoint} failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  return json.data ?? json;
}

// --- Application Helpers ---

export async function createApplication(
  candidateId: string,
  jobId: string,
  recruiterId: string,
  token: string
) {
  return apiRequest('POST', '/applications', {
    candidate_id: candidateId,
    job_id: jobId,
    candidate_recruiter_id: recruiterId,
  }, { token });
}

export async function getApplication(id: string, token: string) {
  return apiRequest('GET', `/applications/${id}`, undefined, { token });
}

export async function advanceApplication(
  id: string,
  stage: string,
  token: string,
  extra?: Record<string, any>
) {
  return apiRequest('PATCH', `/applications/${id}`, {
    stage,
    ...extra,
  }, { token });
}

export async function listApplications(
  token: string,
  params?: Record<string, string>
) {
  return apiRequest('GET', '/applications', undefined, { token, params });
}

// --- Placement Helpers ---

export async function createPlacementFromApplication(
  applicationId: string,
  salary: number,
  feePercentage: number,
  startDate: string,
  token: string
) {
  return apiRequest('POST', '/placements', {
    application_id: applicationId,
    salary,
    fee_percentage: feePercentage,
    start_date: startDate,
  }, { token });
}

export async function getPlacement(id: string, token: string) {
  return apiRequest('GET', `/placements/${id}`, undefined, { token });
}

export async function listPlacements(
  token: string,
  params?: Record<string, string>
) {
  return apiRequest('GET', '/placements', undefined, { token, params });
}

// --- Job Helpers ---

export async function createJob(
  data: {
    title: string;
    description: string;
    company_id: string;
    employment_type?: string;
    location?: string;
    salary_min?: number;
    salary_max?: number;
  },
  token: string
) {
  return apiRequest('POST', '/jobs', data, { token });
}

export async function getJob(id: string, token: string) {
  return apiRequest('GET', `/jobs/${id}`, undefined, { token });
}

// --- Candidate Helpers ---

export async function createCandidate(
  data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  },
  token: string
) {
  return apiRequest('POST', '/candidates', data, { token });
}

// --- Invitation Helpers ---

export async function sendInvitation(
  data: {
    type: string;
    target_id: string;
    permissions?: Record<string, boolean>;
  },
  token: string
) {
  return apiRequest('POST', '/invitations', data, { token });
}

export async function respondToInvitation(
  id: string,
  action: 'accept' | 'decline',
  token: string
) {
  return apiRequest('PATCH', `/invitations/${id}`, { action }, { token });
}

// --- Payout Verification ---

export async function listPayoutSchedules(
  token: string,
  params?: Record<string, string>
) {
  return apiRequest('GET', '/payout-schedules', undefined, { token, params });
}
