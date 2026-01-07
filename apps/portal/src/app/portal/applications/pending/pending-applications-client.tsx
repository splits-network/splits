'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    useStandardList,
    PaginationControls,
    SearchInput,
    EmptyState,
    LoadingState,
    ErrorState,
} from '@/hooks/use-standard-list';
import { formatRelativeTime } from '@/lib/utils';

// ===== TYPES =====

interface Application {
    id: string;
    job_id: string;
    candidate_id: string;
    stage: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    document_count?: number;
    pre_screen_answer_count?: number;
    candidate?: {
        id: string;
        full_name: string;
        email: string;
    };
    job?: {
        id: string;
        title: string;
        location?: string;
        company?: {
            id: string;
            name: string;
        };
    };
}

interface ApplicationFilters {
    stage?: string;
    job_id?: string;
}

// ===== COMPONENT =====

export default function PendingApplicationsClient() {
    const searchParams = useSearchParams();
    const showSuccess = searchParams.get('success') === 'true';

    // Memoize defaultFilters to prevent infinite re-renders in useStandardList
    const defaultFilters = useMemo<ApplicationFilters>(() => ({ stage: 'screen' }), []);

    const {
        data: applications,
        loading,
        error,
        searchInput,
        setSearchInput,
        clearSearch,
        filters,
        setFilter,
        sortBy,
        handleSort,
        getSortIcon,
        page,
        limit,
        totalPages,
        total,
        goToPage,
        setLimit,
        refresh,
    } = useStandardList<Application, ApplicationFilters>({
        endpoint: '/applications',
        defaultFilters, // Only pending (screen stage)
        defaultSortBy: 'created_at',
        defaultSortOrder: 'desc',
        defaultLimit: 25,
        syncToUrl: true,
    });

    // Handle error state
    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <ErrorState message={error} onRetry={refresh} />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Pending Applications</h1>
                <p className="text-lg text-base-content/70">
                    Review and submit applications from your candidates
                </p>
            </div>

            {/* Success Alert */}
            {showSuccess && (
                <div className="alert alert-success mb-6">
                    <i className="fa-solid fa-circle-check"></i>
                    <span>Application successfully submitted to company!</span>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="stats bg-base-100 shadow">
                    <div className="stat py-3">
                        <div className="stat-figure text-warning">
                            <i className="fa-solid fa-clock text-2xl"></i>
                        </div>
                        <div className="stat-title text-sm">Pending Review</div>
                        <div className="stat-value text-2xl text-warning">{total}</div>
                    </div>
                </div>
                <div className="stats bg-base-100 shadow">
                    <div className="stat py-3">
                        <div className="stat-figure text-info">
                            <i className="fa-solid fa-file text-2xl"></i>
                        </div>
                        <div className="stat-title text-sm">With Documents</div>
                        <div className="stat-value text-2xl text-info">
                            {applications.filter(a => (a.document_count || 0) > 0).length}
                        </div>
                    </div>
                </div>
                <div className="stats bg-base-100 shadow">
                    <div className="stat py-3">
                        <div className="stat-figure text-success">
                            <i className="fa-solid fa-clipboard-question text-2xl"></i>
                        </div>
                        <div className="stat-title text-sm">Questions Answered</div>
                        <div className="stat-value text-2xl text-success">
                            {applications.filter(a => (a.pre_screen_answer_count || 0) > 0).length}
                        </div>
                    </div>
                </div>
                <div className="stats bg-base-100 shadow">
                    <div className="stat py-3">
                        <div className="stat-figure text-primary">
                            <i className="fa-solid fa-calendar-day text-2xl"></i>
                        </div>
                        <div className="stat-title text-sm">Today</div>
                        <div className="stat-value text-2xl text-primary">
                            {applications.filter(a => {
                                const created = new Date(a.created_at);
                                const today = new Date();
                                return created.toDateString() === today.toDateString();
                            }).length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="card bg-base-100 shadow mb-6">
                <div className="card-body p-4">
                    <div className="flex flex-wrap gap-4 items-center">
                        <SearchInput
                            value={searchInput}
                            onChange={setSearchInput}
                            onClear={clearSearch}
                            placeholder="Search applications..."
                            loading={loading}
                            className="flex-1 min-w-[200px]"
                        />
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && applications.length === 0 && <LoadingState />}

            {/* Applications List */}
            {applications.length > 0 && (
                <div className="space-y-4">
                    {applications.map((app) => (
                        <ApplicationCard key={app.id} application={app} />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && applications.length === 0 && (
                <EmptyState
                    icon="fa-inbox"
                    title="No Pending Applications"
                    description="You don't have any applications awaiting review at the moment."
                />
            )}

            {/* Pagination */}
            <div className="mt-6">
                <PaginationControls
                    page={page}
                    totalPages={totalPages}
                    total={total}
                    limit={limit}
                    onPageChange={goToPage}
                    onLimitChange={setLimit}
                    loading={loading}
                />
            </div>
        </div>
    );
}

// ===== SUB-COMPONENTS =====

interface ApplicationCardProps {
    application: Application;
}

function ApplicationCard({ application }: ApplicationCardProps) {
    const candidateName = application.candidate?.full_name || 'Unknown Candidate';
    const jobTitle = application.job?.title || 'Unknown Position';
    const companyName = application.job?.company?.name || 'Unknown Company';
    const location = application.job?.location;

    return (
        <div className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
            <div className="card-body">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                        <h3 className="card-title text-2xl mb-2">{candidateName}</h3>
                        <div className="flex items-center gap-2 text-lg font-semibold text-primary mb-3">
                            <i className="fa-solid fa-briefcase"></i>
                            <span>{jobTitle}</span>
                        </div>
                        <p className="text-base-content/70 mb-3">{companyName}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-base-content/60 mb-4">
                            {location && (
                                <span>
                                    <i className="fa-solid fa-location-dot mr-1"></i>
                                    {location}
                                </span>
                            )}
                            <span>
                                <i className="fa-solid fa-calendar mr-1"></i>
                                Submitted {formatRelativeTime(application.created_at)}
                            </span>
                            {application.document_count !== undefined && application.document_count > 0 && (
                                <span>
                                    <i className="fa-solid fa-file mr-1"></i>
                                    {application.document_count} document{application.document_count !== 1 ? 's' : ''}
                                </span>
                            )}
                            {application.pre_screen_answer_count !== undefined && application.pre_screen_answer_count > 0 && (
                                <span>
                                    <i className="fa-solid fa-clipboard-question mr-1"></i>
                                    {application.pre_screen_answer_count} question{application.pre_screen_answer_count !== 1 ? 's' : ''} answered
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="badge badge-warning">
                                <i className="fa-solid fa-clock mr-1"></i>
                                Awaiting Review
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Link
                            href={`/portal/application/${application.id}/review`}
                            className="btn btn-primary"
                        >
                            <i className="fa-solid fa-eye"></i>
                            Review & Submit
                        </Link>
                        <Link
                            href={`/portal/candidates/${application.candidate_id}`}
                            className="btn btn-ghost btn-sm"
                        >
                            <i className="fa-solid fa-user"></i>
                            View Candidate
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
