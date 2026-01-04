'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useViewMode } from '@/hooks/useViewMode';
import { useToast } from '@/lib/toast-context';
import ApplicationCard from './components/application-card';
import { getStatusColor, formatStage } from '@/lib/application-utils';

export default function ApplicationsPage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string; draft?: string }>;
}) {
    const { userId, getToken, isLoaded, isSignedIn } = useAuth();
    const [viewMode, setViewMode] = useViewMode('applicationsViewMode');
    const { success, info } = useToast();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        async function loadApplications() {
            // Wait for Clerk to load before checking authentication
            if (!isLoaded) return;

            if (!isSignedIn || !userId) {
                redirect('/sign-in');
                return;
            }

            const token = await getToken();
            if (!token) {
                redirect('/sign-in');
                return;
            }

            try {
                const client = createAuthenticatedClient(token);
                const data = await client.get('/applications');
                setApplications((data as any).data || data || []);
            } catch (err) {
                console.error('Error fetching applications:', err);
                setError('Failed to load applications');
                setApplications([]);
            } finally {
                setLoading(false);
            }
        }

        loadApplications();
    }, [userId, getToken, isLoaded, isSignedIn]);

    useEffect(() => {
        async function checkSuccess() {
            const params = await searchParams;
            if (params.success === 'true') {
                success("Application submitted successfully! You'll receive an email once it has been reviewed.");
            }
            if (params.draft === 'true') {
                info('Application saved as draft! You can edit and submit it anytime.');
            }
        }
        checkSuccess();
    }, [searchParams, success, info]);

    // Show loading state while Clerk is initializing
    if (!isLoaded) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    // Redirect only after Clerk has loaded and we know the user is not signed in
    if (!isSignedIn) {
        redirect('/sign-in');
    }

    // Filter applications based on search and status
    const filteredApplications = applications.filter(app => {
        // Search filter
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery ||
            app.job?.title?.toLowerCase().includes(searchLower) ||
            app.job?.company?.name?.toLowerCase().includes(searchLower) ||
            app.job?.location?.toLowerCase().includes(searchLower);

        // Status filter
        const matchesStatus = statusFilter === 'all' || app.stage === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const activeApps = filteredApplications.filter(app =>
        !['rejected', 'withdrawn'].includes(app.stage) &&
        app.job?.status !== 'closed' &&
        app.job?.status !== 'filled'
    );
    const inactiveApps = filteredApplications.filter(app =>
        ['rejected', 'withdrawn'].includes(app.stage) ||
        app.job?.status === 'closed' ||
        app.job?.status === 'filled'
    );

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center min-h-[400px]">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">My Applications</h1>
                <p className="text-lg text-base-content/70">
                    Track the status of all your job applications
                </p>
            </div>

            {/* Error Display */}
            {error && (
                <div className="alert alert-error mb-6">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            {/* Stats */}
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
                <div className="stats bg-base-100 shadow">
                    <div className="stat">
                        <div className="stat-figure text-primary">
                            <i className="fa-solid fa-file-lines text-4xl"></i>
                        </div>
                        <div className="stat-title">Total Applications</div>
                        <div className="stat-value text-primary">{applications.length}</div>
                        <div className="stat-desc">All time submissions</div>
                    </div>
                </div>
                <div className="stats bg-base-100 shadow">
                    <div className="stat">
                        <div className="stat-figure text-success">
                            <i className="fa-solid fa-circle-check text-4xl"></i>
                        </div>
                        <div className="stat-title">Active</div>
                        <div className="stat-value text-success">{activeApps.length}</div>
                        <div className="stat-desc">Currently in progress</div>
                    </div>
                </div>
                <div className="stats bg-base-100 shadow">
                    <div className="stat">
                        <div className="stat-figure text-info">
                            <i className="fa-solid fa-comments text-4xl"></i>
                        </div>
                        <div className="stat-title">Interviewing</div>
                        <div className="stat-value text-info">
                            {applications.filter(a => a.stage === 'interviewing').length}
                        </div>
                        <div className="stat-desc">Interview stage</div>
                    </div>
                </div>
                <div className="stats bg-base-100 shadow">
                    <div className="stat">
                        <div className="stat-figure text-warning">
                            <i className="fa-solid fa-trophy text-4xl"></i>
                        </div>
                        <div className="stat-title">Offers</div>
                        <div className="stat-value text-warning">
                            {applications.filter(a => a.stage === 'offer').length}
                        </div>
                        <div className="stat-desc">Received offers</div>
                    </div>
                </div>
            </div>

            {/* Filters and View Toggle */}
            <div className="card bg-base-100 shadow mb-6">
                <div className="card-body">
                    <div className="flex flex-wrap gap-4 items-end">
                        {/* Status Filter */}
                        <div className="fieldset">
                            <label className="label">Status</label>
                            <select
                                className="select w-full max-w-xs"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="draft">Draft</option>
                                <option value="recruiter_proposed">Recruiter Proposed</option>
                                <option value="recruiter_request">Recruiter Request</option>
                                <option value="ai_review">AI Review</option>
                                <option value="screen">Recruiter Review</option>
                                <option value="submitted">Submitted</option>
                                <option value="interviewing">Interviewing</option>
                                <option value="offer">Offer</option>
                                <option value="rejected">Rejected</option>
                                <option value="withdrawn">Withdrawn</option>
                            </select>
                        </div>

                        {/* Search Input */}
                        <div className="fieldset flex-1">
                            <label className="label">Search</label>
                            <input
                                type="text"
                                className="input w-full"
                                placeholder="Search by position, company, or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* View Toggle */}
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

            {/* Grid View - Active Applications */}
            {viewMode === 'grid' && activeApps.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Active Applications</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {activeApps.map((app) => (
                            <ApplicationCard
                                key={app.id}
                                application={app}
                                isActive={true}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Table View - Active Applications */}
            {viewMode === 'table' && activeApps.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Active Applications</h2>
                    <div className="card bg-base-100 shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Position</th>
                                        <th>Company</th>
                                        <th>Location</th>
                                        <th>Status</th>
                                        <th>Recruiter</th>
                                        <th>Applied</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeApps.map((app) => (
                                        <tr key={app.id} className="hover">
                                            <td>
                                                <Link
                                                    href={`/jobs/${app.job_id}`}
                                                    className="font-semibold hover:text-primary"
                                                >
                                                    {app.job?.title || 'Unknown Position'}
                                                </Link>
                                            </td>
                                            <td>{app.job?.company?.name || 'Unknown Company'}</td>
                                            <td>
                                                {app.job?.location && (
                                                    <span className="text-sm">
                                                        <i className="fa-solid fa-location-dot"></i> {app.job.location}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge badge-sm ${getStatusColor(app.stage)}`}>
                                                    {formatStage(app.stage)}
                                                </span>
                                            </td>
                                            <td>
                                                {app.recruiter ? (
                                                    <span className="text-sm">
                                                        {app.recruiter.first_name} {app.recruiter.last_name}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-base-content/50">-</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="text-sm">{formatDate(app.created_at)}</span>
                                            </td>
                                            <td>
                                                <div className="flex gap-2 justify-end">
                                                    <Link
                                                        href={`/applications/${app.id}`}
                                                        className="btn btn-sm btn-ghost"
                                                        title="View Details"
                                                    >
                                                        <i className="fa-solid fa-eye"></i>
                                                    </Link>
                                                    <Link
                                                        href={`/jobs/${app.job_id}`}
                                                        className="btn btn-sm btn-ghost"
                                                        title="View Job"
                                                    >
                                                        <i className="fa-solid fa-briefcase"></i>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Grid View - Inactive Applications */}
            {viewMode === 'grid' && inactiveApps.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Archived Applications</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {inactiveApps.map((app) => (
                            <ApplicationCard
                                key={app.id}
                                application={app}
                                isActive={false}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Table View - Inactive Applications */}
            {viewMode === 'table' && inactiveApps.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Archived Applications</h2>
                    <div className="card bg-base-100 shadow overflow-hidden opacity-70">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Position</th>
                                        <th>Company</th>
                                        <th>Location</th>
                                        <th>Status</th>
                                        <th>Applied</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inactiveApps.map((app) => (
                                        <tr key={app.id} className="hover">
                                            <td>
                                                <span className="font-semibold">
                                                    {app.job?.title || 'Unknown Position'}
                                                </span>
                                            </td>
                                            <td>{app.job?.company?.name || 'Unknown Company'}</td>
                                            <td>
                                                {app.job?.location && (
                                                    <span className="text-sm">
                                                        <i className="fa-solid fa-location-dot"></i> {app.job.location}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge badge-sm ${getStatusColor(app.stage)}`}>
                                                    {formatStage(app.stage)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-sm">{formatDate(app.created_at)}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {filteredApplications.length === 0 && (
                <div className="card bg-base-100 shadow">
                    <div className="card-body text-center py-12">
                        <i className="fa-solid fa-inbox text-6xl text-base-content/20 mb-4"></i>
                        <h3 className="text-2xl font-bold mb-2">
                            {applications.length === 0 ? 'No Applications Yet' : 'No Applications Found'}
                        </h3>
                        <p className="text-base-content/70 mb-6">
                            {applications.length === 0
                                ? 'Start applying to jobs to track your applications here'
                                : 'Try adjusting your search or filters'}
                        </p>
                        {applications.length === 0 && (
                            <Link href="/jobs" className="btn btn-primary">
                                <i className="fa-solid fa-search"></i>
                                Browse Jobs
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
