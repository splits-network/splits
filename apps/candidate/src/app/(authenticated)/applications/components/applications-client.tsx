'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useStandardList } from '@/hooks/use-standard-list';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/lib/toast-context';
import ApplicationCard from './application-card';
import { getStatusColor, formatStage } from '@/lib/application-utils';

// ===== TYPES =====

interface Application {
    id: string;
    job_id: string;
    candidate_id: string;
    stage: string;
    created_at: string;
    updated_at: string;
    job?: {
        id: string;
        title: string;
        location?: string;
        status?: string;
        company?: {
            id: string;
            name: string;
        };
    };
    recruiter?: {
        id: string;
        first_name?: string;
        last_name?: string;
    };
}

interface ApplicationFilters {
    stage?: string;
}

// ===== CONSTANTS =====

const DEFAULT_FILTERS: ApplicationFilters = {};

// ===== CLIENT COMPONENT =====

export default function ApplicationsClient() {
    const searchParams = useSearchParams();
    const { success, info } = useToast();

    const {
        data: applications,
        loading,
        error,
        searchInput,
        setSearchInput,
        filters,
        setFilter,
        pagination,
        page,
        goToPage,
        nextPage,
        prevPage,
        viewMode,
        setViewMode,
        refresh,
    } = useStandardList<Application, ApplicationFilters>({
        endpoint: '/applications',
        defaultFilters: DEFAULT_FILTERS,
        defaultSortBy: 'created_at',
        defaultSortOrder: 'desc',
        include: 'job,recruiter',
        viewModeKey: 'candidateApplicationsViewMode',
    });

    // Handle success/draft query params from redirects
    useEffect(() => {
        const successParam = searchParams.get('success');
        const draftParam = searchParams.get('draft');

        if (successParam === 'true') {
            success("Application submitted successfully! You'll receive an email once it has been reviewed.");
        }
        if (draftParam === 'true') {
            info('Application saved as draft! You can edit and submit it anytime.');
        }
    }, [searchParams, success, info]);

    // Split applications into active and archived
    const activeApps = applications.filter(app =>
        !['rejected', 'withdrawn'].includes(app.stage) &&
        app.job?.status !== 'closed' &&
        app.job?.status !== 'filled'
    );
    const archivedApps = applications.filter(app =>
        ['rejected', 'withdrawn'].includes(app.stage) ||
        app.job?.status === 'closed' ||
        app.job?.status === 'filled'
    );

    // Stats calculations
    const stats = {
        total: applications.length,
        active: activeApps.length,
        interviewing: applications.filter(a => a.stage === 'interviewing').length,
        offers: applications.filter(a => a.stage === 'offer').length,
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="stats bg-base-100 shadow">
                    <div className="stat">
                        <div className="stat-figure text-primary">
                            <i className="fa-solid fa-file-lines text-4xl"></i>
                        </div>
                        <div className="stat-title">Total Applications</div>
                        <div className="stat-value text-primary">{stats.total}</div>
                        <div className="stat-desc">All time submissions</div>
                    </div>
                </div>
                <div className="stats bg-base-100 shadow">
                    <div className="stat">
                        <div className="stat-figure text-success">
                            <i className="fa-solid fa-circle-check text-4xl"></i>
                        </div>
                        <div className="stat-title">Active</div>
                        <div className="stat-value text-success">{stats.active}</div>
                        <div className="stat-desc">Currently in progress</div>
                    </div>
                </div>
                <div className="stats bg-base-100 shadow">
                    <div className="stat">
                        <div className="stat-figure text-info">
                            <i className="fa-solid fa-comments text-4xl"></i>
                        </div>
                        <div className="stat-title">Interviewing</div>
                        <div className="stat-value text-info">{stats.interviewing}</div>
                        <div className="stat-desc">Interview stage</div>
                    </div>
                </div>
                <div className="stats bg-base-100 shadow">
                    <div className="stat">
                        <div className="stat-figure text-warning">
                            <i className="fa-solid fa-trophy text-4xl"></i>
                        </div>
                        <div className="stat-title">Offers</div>
                        <div className="stat-value text-warning">{stats.offers}</div>
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
                                value={filters.stage || 'all'}
                                onChange={(e) => setFilter('stage', e.target.value === 'all' ? undefined : e.target.value)}
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
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
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

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center min-h-[400px]">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            )}

            {/* Content */}
            {!loading && (
                <>
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
                                                                <i className="fa-solid fa-location-dot mr-1"></i>
                                                                {app.job.location}
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

                    {/* Grid View - Archived Applications */}
                    {viewMode === 'grid' && archivedApps.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Archived Applications</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {archivedApps.map((app) => (
                                    <ApplicationCard
                                        key={app.id}
                                        application={app}
                                        isActive={false}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Table View - Archived Applications */}
                    {viewMode === 'table' && archivedApps.length > 0 && (
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
                                            {archivedApps.map((app) => (
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
                                                                <i className="fa-solid fa-location-dot mr-1"></i>
                                                                {app.job.location}
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
                    {applications.length === 0 && (
                        <div className="card bg-base-100 shadow">
                            <div className="card-body text-center py-12">
                                <i className="fa-solid fa-inbox text-6xl text-base-content/20 mb-4"></i>
                                <h3 className="text-2xl font-bold mb-2">No Applications Yet</h3>
                                <p className="text-base-content/70 mb-6">
                                    Start applying to jobs to track your applications here
                                </p>
                                <Link href="/jobs" className="btn btn-primary">
                                    <i className="fa-solid fa-search"></i>
                                    Browse Jobs
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.total_pages > 1 && (
                        <div className="flex justify-center mt-8">
                            <div className="join">
                                <button
                                    className="join-item btn"
                                    disabled={page <= 1}
                                    onClick={prevPage}
                                >
                                    <i className="fa-solid fa-chevron-left"></i>
                                </button>
                                <button className="join-item btn">
                                    Page {page} of {pagination.total_pages}
                                </button>
                                <button
                                    className="join-item btn"
                                    disabled={page >= pagination.total_pages}
                                    onClick={nextPage}
                                >
                                    <i className="fa-solid fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

