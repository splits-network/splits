// Progressive Loading Pattern Example
// Load critical data first, secondary data in parallel

'use client';

import { useState, useEffect } from 'react';
import { createApiClient } from '@splits-network/shared-api-client';

const client = createApiClient();

export default function JobDetailPage({ params }: { params: { id: string } }) {
    // Primary data state
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Secondary data state
    const [applications, setApplications] = useState([]);
    const [applicationsLoading, setApplicationsLoading] = useState(true);
    const [applicationsError, setApplicationsError] = useState(null);

    const [requirements, setRequirements] = useState([]);
    const [requirementsLoading, setRequirementsLoading] = useState(true);

    const [company, setCompany] = useState(null);
    const [companyLoading, setCompanyLoading] = useState(true);

    // Load primary data immediately (job details)
    // Time to first content: ~100-200ms
    useEffect(() => {
        async function loadJob() {
            try {
                const response = await client.get(`/jobs/${params.id}`);
                setJob(response.data);
            } catch (err) {
                setError(err.message || 'Failed to load job');
            } finally {
                setLoading(false);
            }
        }
        loadJob();
    }, [params.id]);

    // Load secondary data in parallel after job loads
    // Each has independent state - failures don't break entire page
    useEffect(() => {
        if (!job) return;

        async function loadApplications() {
            try {
                const response = await client.get(`/applications?job_id=${params.id}&include=candidate`);
                setApplications(response.data);
            } catch (err) {
                setApplicationsError(err.message);
            } finally {
                setApplicationsLoading(false);
            }
        }

        async function loadRequirements() {
            try {
                const response = await client.get(`/job-requirements?job_id=${params.id}`);
                setRequirements(response.data);
            } finally {
                setRequirementsLoading(false);
            }
        }

        async function loadCompany() {
            try {
                const response = await client.get(`/companies/${job.company_id}`);
                setCompany(response.data);
            } finally {
                setCompanyLoading(false);
            }
        }

        // Launch all secondary requests in parallel
        loadApplications();
        loadRequirements();
        loadCompany();
    }, [job, params.id]);

    // Show page structure immediately with loading states
    // User sees content in ~100-200ms, not 2-5 seconds
    return (
        <div className="space-y-6">
            {/* Primary content - shows first */}
            {loading ? (
                <div className="skeleton h-32 w-full"></div>
            ) : error ? (
                <div className="alert alert-error">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            ) : (
                <div className="card">
                    <div className="card-body">
                        <h1 className="card-title text-3xl">{job.title}</h1>
                        <p className="text-base-content/70">{job.location}</p>
                        <div className="badge badge-primary">{job.status}</div>
                    </div>
                </div>
            )}

            {/* Company info - loads independently */}
            <div className="card">
                <div className="card-body">
                    <h2 className="card-title">Company</h2>
                    {companyLoading ? (
                        <div className="skeleton h-16 w-full"></div>
                    ) : company ? (
                        <div>
                            <p className="font-semibold">{company.name}</p>
                            <p className="text-sm text-base-content/70">{company.industry}</p>
                        </div>
                    ) : (
                        <p className="text-base-content/50">Company information unavailable</p>
                    )}
                </div>
            </div>

            {/* Requirements - loads independently */}
            <div className="card">
                <div className="card-body">
                    <h2 className="card-title">Requirements</h2>
                    {requirementsLoading ? (
                        <div className="loading loading-spinner"></div>
                    ) : (
                        <ul className="list-disc list-inside space-y-1">
                            {requirements.map((req) => (
                                <li key={req.id}>{req.description}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Applications - loads independently with error handling */}
            <div className="card">
                <div className="card-body">
                    <h2 className="card-title">Applications ({applications.length})</h2>
                    {applicationsError && (
                        <div className="alert alert-warning">
                            <span>Could not load applications: {applicationsError}</span>
                        </div>
                    )}
                    {applicationsLoading ? (
                        <div className="loading loading-spinner"></div>
                    ) : (
                        <div className="space-y-2">
                            {applications.map((app) => (
                                <div key={app.id} className="flex items-center gap-4 p-4 bg-base-200 rounded">
                                    <div>
                                        <p className="font-semibold">{app.candidate?.name}</p>
                                        <p className="text-sm text-base-content/70">{app.stage}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Performance Impact:
 * 
 * ❌ Monolithic Loading (all data in one effect):
 * - Time to first content: 2-5 seconds
 * - User sees blank page while waiting
 * - One failure breaks entire page
 * 
 * ✅ Progressive Loading (this pattern):
 * - Time to first content: 100-200ms
 * - User sees job details immediately
 * - Secondary data fills in progressively
 * - Each section handles errors independently
 * - Total page load: 500ms-1s (vs 5-10s)
 */
