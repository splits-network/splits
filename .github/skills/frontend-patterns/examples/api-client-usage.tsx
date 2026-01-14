// API Client Usage Examples

'use client';

import { useState } from 'react';
import { createApiClient } from '@splits-network/shared-api-client';

const client = createApiClient();

// Example 1: Simple GET request
export async function fetchJobs() {
    // shared-api-client automatically prepends /api/v2
    // This calls /api/v2/jobs
    const { data, pagination } = await client.get('/jobs');
    return { data, pagination };
}

// Example 2: GET with query parameters
export async function searchJobs(searchTerm: string, status: string) {
    const params = new URLSearchParams({
        search: searchTerm,
        status: status,
        page: '1',
        limit: '25',
    });

    const { data, pagination } = await client.get(`/jobs?${params}`);
    return { data, pagination };
}

// Example 3: GET by ID with includes
export async function fetchJobWithDetails(id: string) {
    const { data } = await client.get(`/jobs/${id}?include=company,requirements`);
    return data;
}

// Example 4: POST request (create)
export async function createJob(jobData: any) {
    try {
        const { data } = await client.post('/jobs', jobData);
        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to create job'
        };
    }
}

// Example 5: PATCH request (update)
export async function updateJob(id: string, updates: any) {
    try {
        const { data } = await client.patch(`/jobs/${id}`, updates);
        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to update job'
        };
    }
}

// Example 6: DELETE request
export async function deleteJob(id: string) {
    try {
        await client.delete(`/jobs/${id}`);
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to delete job'
        };
    }
}

// Example 7: Component with error handling
export function JobForm() {
    const [formData, setFormData] = useState({ title: '', location: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const { data } = await client.post('/jobs', formData);
            setSuccess(true);
            console.log('Created job:', data);
        } catch (err: any) {
            setError(err.message || 'Failed to create job');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {error && (
                <div className="alert alert-error mb-4">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="alert alert-success mb-4">
                    <i className="fa-duotone fa-regular fa-circle-check"></i>
                    <span>Job created successfully!</span>
                </div>
            )}

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Job Title</legend>
                <input
                    type="text"
                    className="input w-full"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                />
            </fieldset>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                    <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Creating...
                    </>
                ) : (
                    'Create Job'
                )}
            </button>
        </form>
    );
}

// Example 8: Using /me alias for current user
export async function fetchCurrentCandidate() {
    // Uses /me alias to get current user's candidate profile
    const { data } = await client.get('/candidates/me');
    return data;
}

// Example 9: Batch requests with Promise.all
export async function fetchDashboardData(userId: string) {
    const [jobs, applications, stats] = await Promise.all([
        client.get(`/jobs?recruiter_id=${userId}&limit=5`),
        client.get(`/applications?recruiter_id=${userId}&limit=5`),
        client.get(`/stats?scope=recruiter`),
    ]);

    return {
        recentJobs: jobs.data,
        recentApplications: applications.data,
        stats: stats.data,
    };
}

// Example 10: Polling pattern for status updates
export function useJobStatusPolling(jobId: string) {
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        async function checkStatus() {
            try {
                const { data } = await client.get(`/jobs/${jobId}`);
                setStatus(data.status);
            } catch (err) {
                console.error('Failed to check status:', err);
            }
        }

        // Poll every 5 seconds
        const interval = setInterval(checkStatus, 5000);
        checkStatus(); // Initial check

        return () => clearInterval(interval);
    }, [jobId]);

    return status;
}
