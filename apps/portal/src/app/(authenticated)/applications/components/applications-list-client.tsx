'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useViewMode } from '@/hooks/use-view-mode';

interface Application {
    id: string;
    job_id: string;
    candidate_id: string;
    recruiter_id?: string; // This is the user_id, not recruiter table ID
    stage: string;
    accepted_by_company: boolean;
    accepted_at?: string;
    created_at: string;
    updated_at: string;
    candidate?: {
        id: string;
        full_name: string;
        email: string;
        linkedin_url?: string;
        _masked?: boolean;
    };
    recruiter?: {
        id: string;
        name: string;
        email: string;
    };
    job?: {
        id: string;
        title: string;
    };
}

export default function ApplicationsListClient() {
    const { getToken } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [stageFilter, setStageFilter] = useState('');
    const [viewMode, setViewMode] = useViewMode('applicationsViewMode');
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [acceptingId, setAcceptingId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [recruiterId, setRecruiterId] = useState<string | null>(null);

    useEffect(() => {
        async function loadApplications() {
            try {
                setLoading(true);
                setError(null);

                const token = await getToken();
                if (!token) {
                    setError('Not authenticated');
                    return;
                }

                const client = createAuthenticatedClient(token);

                // Get user profile to get company context
                const profileRes = await client.get('/me');
                const profile = profileRes.data;

                const membership = profile?.memberships?.[0];
                const role = membership?.role;
                const uid = profile?.user_id;
                setUserRole(role);
                setUserId(uid);

                // Get company ID for company users
                if (role === 'company_admin' || role === 'hiring_manager') {
                    // Get company by org ID
                    const companiesRes = await client.get(`/companies?org_id=${membership.organization_id}`);
                    const companies = companiesRes.data || [];
                    if (companies.length > 0) {
                        const cid = companies[0].id;
                        setCompanyId(cid);

                        // Load applications for this company
                        const response = await client.get(`/companies/${cid}/applications`);
                        const apps = response.data || [];

                        // Enrich applications with candidate and job data
                        const enrichedApps = await Promise.all(
                            apps.map(async (app: Application) => {
                                try {
                                    // Fetch candidate data
                                    const candidateRes = await client.get(`/candidates/${app.candidate_id}`);
                                    // Fetch job data
                                    const jobRes = await client.get(`/jobs/${app.job_id}`);

                                    return {
                                        ...app,
                                        candidate: candidateRes.data,
                                        job: jobRes.data,
                                    };
                                } catch (err) {
                                    console.error(`Failed to enrich application ${app.id}:`, err);
                                    return app;
                                }
                            })
                        );

                        setApplications(enrichedApps);
                    }
                } else if (role === 'recruiter') {
                    // Get recruiter profile
                    const recruiterRes = await client.get('/recruiters/me');
                    const recruiter = recruiterRes.data;
                    const rid = recruiter?.id;
                    const userIdFromProfile = recruiter?.user_id;
                    setRecruiterId(rid);
                    setUserId(userIdFromProfile);

                    if (rid && userIdFromProfile) {
                        // Get all applications
                        const allAppsRes = await client.get('/applications');
                        const allApps = allAppsRes.data || [];

                        // Get recruiter's candidate relationships using the /me endpoint (accessible by recruiters)
                        const relationshipsRes = await client.get('/recruiter-candidates/me');
                        const relationships = relationshipsRes.data || [];
                        // Filter to only active relationships
                        const activeRelationships = relationships.filter((r: any) => r.status === 'active');
                        const assignedCandidateIds = new Set(activeRelationships.map((r: any) => r.candidate_id));

                        // Filter applications: owned by recruiter (compare user_id) OR for assigned candidates
                        const filteredApps = allApps.filter((app: Application) => {
                            // applications.recruiter_id stores user_id, not recruiter table id
                            const ownsApplication = app.recruiter_id === userIdFromProfile;
                            const hasRelationship = assignedCandidateIds.has(app.candidate_id);
                            return ownsApplication || hasRelationship;
                        });

                        // Enrich applications with candidate and job data
                        const enrichedApps = await Promise.all(
                            filteredApps.map(async (app: Application) => {
                                try {
                                    // Fetch candidate data
                                    const candidateRes = await client.get(`/candidates/${app.candidate_id}`);
                                    // Fetch job data
                                    const jobRes = await client.get(`/jobs/${app.job_id}`);

                                    return {
                                        ...app,
                                        candidate: candidateRes.data,
                                        job: jobRes.data,
                                    };
                                } catch (err) {
                                    console.error(`Failed to enrich application ${app.id}:`, err);
                                    return app; // Return original if enrichment fails
                                }
                            })
                        );

                        setApplications(enrichedApps);
                    }
                } else {
                    // Platform admins see all applications
                    const response = await client.get('/applications');
                    const apps = response.data || [];

                    // Enrich applications with candidate and job data
                    const enrichedApps = await Promise.all(
                        apps.map(async (app: Application) => {
                            try {
                                // Fetch candidate data
                                const candidateRes = await client.get(`/candidates/${app.candidate_id}`);
                                // Fetch job data
                                const jobRes = await client.get(`/jobs/${app.job_id}`);

                                return {
                                    ...app,
                                    candidate: candidateRes.data,
                                    job: jobRes.data,
                                };
                            } catch (err) {
                                console.error(`Failed to enrich application ${app.id}:`, err);
                                return app;
                            }
                        })
                    );

                    setApplications(enrichedApps);
                }
            } catch (err: any) {
                console.error('Failed to load applications:', err);
                setError(err.message || 'Failed to load applications');
            } finally {
                setLoading(false);
            }
        }

        loadApplications();
    }, [getToken]);

    const handleAcceptApplication = async (applicationId: string) => {
        try {
            setAcceptingId(applicationId);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            await client.post(`/applications/${applicationId}/accept`, {});

            // Reload applications to get updated data
            if (companyId) {
                const response = await client.get(`/companies/${companyId}/applications`);
                setApplications(response.data || []);
            }
        } catch (err: any) {
            console.error('Failed to accept application:', err);
            setError(err.message || 'Failed to accept application');
        } finally {
            setAcceptingId(null);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStageColor = (stage: string) => {
        const colors: Record<string, string> = {
            submitted: 'badge-info',
            screen: 'badge-primary',
            interview: 'badge-warning',
            offer: 'badge-success',
            hired: 'badge-success',
            rejected: 'badge-error',
        };
        return colors[stage] || 'badge-ghost';
    };

    const filteredApplications = applications.filter(app => {
        const candidate = app.candidate || { full_name: '', email: '' };
        const job = app.job || { title: '' };
        const matchesSearch = searchQuery === '' ||
            candidate.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.title.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStage = stageFilter === '' || app.stage === stageFilter;

        return matchesSearch && matchesStage;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg"></span>
                    <p className="mt-4 text-base-content/70">Loading applications...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{error}</span>
            </div>
        );
    }

    const isCompanyUser = userRole === 'company_admin' || userRole === 'hiring_manager';
    const isRecruiter = userRole === 'recruiter';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Applications</h1>
                    <p className="text-base-content/70 mt-1">
                        {isCompanyUser
                            ? 'Candidate submissions to your jobs'
                            : isRecruiter
                                ? 'Applications for your assigned candidates'
                                : 'All candidate applications'}
                    </p>
                </div>
            </div>

            {/* Filters and View Toggle */}
            <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="fieldset flex-1">
                            <label className="label">Search</label>
                            <input
                                type="text"
                                placeholder="Search candidates or jobs..."
                                className="input w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="fieldset">
                            <label className="label">Stage</label>
                            <select
                                className="select w-full max-w-xs"
                                value={stageFilter}
                                onChange={(e) => setStageFilter(e.target.value)}
                            >
                                <option value="">All Stages</option>
                                <option value="submitted">Submitted</option>
                                <option value="screen">Screen</option>
                                <option value="interview">Interview</option>
                                <option value="offer">Offer</option>
                                <option value="hired">Hired</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="join">
                            <button
                                className={`btn join-item ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setViewMode('grid')}
                                title="Grid View"
                            >
                                <i className="fa-solid fa-grip"></i>
                            </button>
                            <button
                                className={`btn join-item ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setViewMode('table')}
                                title="Table View"
                            >
                                <i className="fa-solid fa-table"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Applications List - Grid View */}
            {viewMode === 'grid' && filteredApplications.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {filteredApplications.map((application) => {
                        const candidate = application.candidate || {
                            id: '',
                            full_name: 'Unknown',
                            email: '',
                            _masked: false
                        };
                        const isMasked = candidate._masked;
                        const canAccept = isCompanyUser && !application.accepted_by_company;

                        return (
                            <div key={application.id} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="avatar avatar-placeholder">
                                                <div className="bg-primary/10 text-primary rounded-full w-12">
                                                    <span className="text-lg">
                                                        {isMasked ? <i className="fa-solid fa-user-secret"></i> : candidate.full_name[0]}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="card-title text-xl">
                                                    {isMasked && (
                                                        <i className="fa-solid fa-eye-slash text-warning mr-1" title="Anonymous"></i>
                                                    )}
                                                    {candidate.full_name}
                                                </h3>
                                                <div className="text-sm text-base-content/70 mt-1">
                                                    {!isMasked && (
                                                        <a href={`mailto:${candidate.email}`} className="link link-hover">
                                                            {candidate.email}
                                                        </a>
                                                    )}
                                                    {isMasked && (
                                                        <span className="italic">{candidate.email}</span>
                                                    )}
                                                </div>
                                                {application.job && (
                                                    <div className="text-sm mt-2 flex items-center gap-2">
                                                        <i className="fa-solid fa-briefcase text-base-content/40"></i>
                                                        <span className="font-medium text-base-content">{application.job.title}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`badge ${getStageColor(application.stage)}`}>
                                            {application.stage}
                                        </span>
                                    </div>

                                    {application.recruiter && (
                                        <div className="text-sm mt-2">
                                            <span className="text-base-content/60">Submitted by:</span>{' '}
                                            <span className="font-medium">{application.recruiter.name}</span>
                                        </div>
                                    )}

                                    {isMasked && !application.accepted_by_company && (
                                        <div className="alert alert-warning mt-3">
                                            <i className="fa-solid fa-info-circle"></i>
                                            <span className="text-xs">Accept to view full details</span>
                                        </div>
                                    )}

                                    {application.accepted_by_company && (
                                        <div className="badge badge-success gap-2 mt-3">
                                            <i className="fa-solid fa-check"></i>
                                            Accepted {application.accepted_at && `on ${formatDate(application.accepted_at)}`}
                                        </div>
                                    )}

                                    <div className="card-actions justify-between items-center mt-4">
                                        <span className="text-sm text-base-content/60">
                                            Submitted {formatDate(application.created_at)}
                                        </span>
                                        <div className="flex gap-2">
                                            {canAccept && (
                                                <button
                                                    onClick={() => handleAcceptApplication(application.id)}
                                                    className="btn btn-success btn-sm gap-2"
                                                    disabled={acceptingId === application.id}
                                                >
                                                    {acceptingId === application.id ? (
                                                        <>
                                                            <span className="loading loading-spinner loading-xs"></span>
                                                            Accepting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fa-solid fa-check"></i>
                                                            Accept
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                            <Link
                                                href={`/applications/${application.id}`}
                                                className="btn btn-primary btn-sm gap-2"
                                            >
                                                View Details
                                                <i className="fa-solid fa-arrow-right"></i>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Applications List - Table View */}
            {viewMode === 'table' && filteredApplications.length > 0 && (
                <div className="card bg-base-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Candidate</th>
                                    <th>Job</th>
                                    <th>Recruiter</th>
                                    <th>Stage</th>
                                    <th>Status</th>
                                    <th>Submitted</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredApplications.map((application) => {
                                    const candidate = application.candidate || {
                                        id: '',
                                        full_name: 'Unknown',
                                        email: '',
                                        _masked: false
                                    };
                                    const isMasked = candidate._masked;
                                    const canAccept = isCompanyUser && !application.accepted_by_company;

                                    return (
                                        <tr key={application.id} className="hover">
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar avatar-placeholder">
                                                        <div className="bg-primary/10 text-primary rounded-full w-10">
                                                            <span className="text-sm">
                                                                {isMasked ? <i className="fa-solid fa-user-secret"></i> : candidate.full_name[0]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold flex items-center gap-2">
                                                            {isMasked && (
                                                                <i className="fa-solid fa-eye-slash text-warning" title="Anonymous"></i>
                                                            )}
                                                            {candidate.full_name}
                                                        </div>
                                                        <div className="text-sm text-base-content/70">
                                                            {!isMasked && candidate.email}
                                                            {isMasked && <span className="italic">{candidate.email}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                {application.job ? (
                                                    <div className="text-sm font-medium">
                                                        {application.job.title}
                                                    </div>
                                                ) : (
                                                    <span className="text-base-content/40">—</span>
                                                )}
                                            </td>
                                            <td>
                                                {application.recruiter ? (
                                                    <div className="text-sm">
                                                        {application.recruiter.name}
                                                    </div>
                                                ) : (
                                                    <span className="text-base-content/40">—</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge ${getStageColor(application.stage)}`}>
                                                    {application.stage}
                                                </span>
                                            </td>
                                            <td>
                                                {application.accepted_by_company ? (
                                                    <span className="badge badge-success gap-2">
                                                        <i className="fa-solid fa-check"></i>
                                                        Accepted
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-warning gap-2">
                                                        <i className="fa-solid fa-clock"></i>
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="text-sm">{formatDate(application.created_at)}</div>
                                            </td>
                                            <td className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    {canAccept && (
                                                        <button
                                                            onClick={() => handleAcceptApplication(application.id)}
                                                            className="btn btn-success btn-sm"
                                                            disabled={acceptingId === application.id}
                                                        >
                                                            {acceptingId === application.id ? (
                                                                <span className="loading loading-spinner loading-xs"></span>
                                                            ) : (
                                                                <i className="fa-solid fa-check"></i>
                                                            )}
                                                        </button>
                                                    )}
                                                    <Link
                                                        href={`/applications/${application.id}`}
                                                        className="btn btn-primary btn-sm"
                                                    >
                                                        <i className="fa-solid fa-arrow-right"></i>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {filteredApplications.length === 0 && (
                <div className="card bg-base-100 shadow-sm">
                    <div className="card-body text-center py-12">
                        <i className="fa-solid fa-folder-open text-6xl text-base-content/20 mb-4"></i>
                        <h3 className="text-xl font-semibold">No applications found</h3>
                        <p className="text-base-content/70">
                            {searchQuery || stageFilter
                                ? 'Try adjusting your filters'
                                : isCompanyUser
                                    ? 'No candidates have been submitted to your jobs yet'
                                    : isRecruiter
                                        ? 'No applications for your assigned candidates yet'
                                        : 'No applications to display'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
