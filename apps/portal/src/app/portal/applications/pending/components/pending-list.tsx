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
import { DataTable, type TableColumn } from '@/components/ui/tables';
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
    company?: {
        id: string;
        name: string;
    };
}

interface ApplicationFilters {
    stage?: string;
    job_id?: string;
}

// ===== TABLE COLUMNS =====

const pendingColumns: TableColumn[] = [
    { key: 'candidate', label: 'Candidate', sortable: true },
    { key: 'job', label: 'Position', sortable: true },
    { key: 'company', label: 'Company', sortable: false },
    { key: 'documents', label: 'Documents', sortable: false },
    { key: 'submitted', label: 'Submitted', sortable: true },
    { key: 'actions', label: 'Actions', align: 'right' },
];

// ===== COMPONENT =====

export default function PendingApplicationsList() {
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
        sortBy,
        sortOrder,
        handleSort,
        page,
        limit,
        totalPages,
        total,
        goToPage,
        setLimit,
        refresh,
    } = useStandardList<Application, ApplicationFilters>({
        endpoint: '/applications',
        defaultFilters,
        defaultSortBy: 'created_at',
        defaultSortOrder: 'desc',
        defaultLimit: 25,
        syncToUrl: true,
        include: 'job.company,candidate',
    });

    // Handle error state
    if (error) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (
        <div className="space-y-6">
            {/* Success Alert */}
            {showSuccess && (
                <div className="alert alert-success">
                    <i className="fa-duotone fa-regular fa-circle-check"></i>
                    <span>Application successfully submitted to company!</span>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stats bg-base-200 shadow">
                    <div className="stat py-3">
                        <div className="stat-figure text-warning">
                            <i className="fa-duotone fa-regular fa-clock text-2xl"></i>
                        </div>
                        <div className="stat-title text-sm">Pending Review</div>
                        <div className="stat-value text-2xl text-warning">{total}</div>
                    </div>
                </div>
                <div className="stats bg-base-200 shadow">
                    <div className="stat py-3">
                        <div className="stat-figure text-info">
                            <i className="fa-duotone fa-regular fa-file text-2xl"></i>
                        </div>
                        <div className="stat-title text-sm">With Documents</div>
                        <div className="stat-value text-2xl text-info">
                            {applications.filter((a) => (a.document_count || 0) > 0).length}
                        </div>
                    </div>
                </div>
                <div className="stats bg-base-200 shadow">
                    <div className="stat py-3">
                        <div className="stat-figure text-success">
                            <i className="fa-duotone fa-regular fa-clipboard-question text-2xl"></i>
                        </div>
                        <div className="stat-title text-sm">Questions Answered</div>
                        <div className="stat-value text-2xl text-success">
                            {applications.filter((a) => (a.pre_screen_answer_count || 0) > 0).length}
                        </div>
                    </div>
                </div>
                <div className="stats bg-base-200 shadow">
                    <div className="stat py-3">
                        <div className="stat-figure text-primary">
                            <i className="fa-duotone fa-regular fa-calendar-day text-2xl"></i>
                        </div>
                        <div className="stat-title text-sm">Today</div>
                        <div className="stat-value text-2xl text-primary">
                            {applications.filter((a) => {
                                const created = new Date(a.created_at);
                                const today = new Date();
                                return created.toDateString() === today.toDateString();
                            }).length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="card bg-base-200 shadow">
                <div className="card-body p-4">
                    <SearchInput
                        value={searchInput}
                        onChange={setSearchInput}
                        onClear={clearSearch}
                        placeholder="Search applications..."
                        loading={loading}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Loading State */}
            {loading && applications.length === 0 && <LoadingState />}

            {/* Applications Table */}
            {!loading && applications.length > 0 && (
                <DataTable
                    columns={pendingColumns}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    showExpandColumn={false}
                    isEmpty={applications.length === 0}
                    loading={loading}
                >
                    {applications.map((app) => (
                        <ApplicationRow key={app.id} application={app} />
                    ))}
                </DataTable>
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
    );
}

// ===== SUB-COMPONENTS =====

interface ApplicationRowProps {
    application: Application;
}

function ApplicationRow({ application }: ApplicationRowProps) {
    const candidateName = application.candidate?.full_name || 'Unknown Candidate';
    const jobTitle = application.job?.title || 'Unknown Position';
    const companyName = application.job?.company?.name || 'Unknown Company';
    const location = application.job?.location;

    return (
        <tr className="hover">
            <td>
                <div className="flex flex-col">
                    <span className="font-semibold">{candidateName}</span>
                    <span className="text-sm text-base-content/60">{application.candidate?.email}</span>
                </div>
            </td>
            <td>
                <div className="flex flex-col">
                    <span className="font-medium">{jobTitle}</span>
                    {location && <span className="text-sm text-base-content/60">{location}</span>}
                </div>
            </td>
            <td>{companyName}</td>
            <td>
                <div className="flex flex-col gap-1 text-sm">
                    {application.document_count !== undefined && application.document_count > 0 && (
                        <span className="badge badge-info badge-sm gap-1">
                            <i className="fa-duotone fa-regular fa-file"></i>
                            {application.document_count}
                        </span>
                    )}
                    {application.pre_screen_answer_count !== undefined && application.pre_screen_answer_count > 0 && (
                        <span className="badge badge-success badge-sm gap-1">
                            <i className="fa-duotone fa-regular fa-clipboard-question"></i>
                            {application.pre_screen_answer_count}
                        </span>
                    )}
                </div>
            </td>
            <td>
                <span className="text-sm">{formatRelativeTime(application.created_at)}</span>
            </td>
            <td>
                <div className="flex gap-2 justify-end">
                    <Link
                        href={`/portal/applications/${application.id}/review`}
                        className="btn btn-primary btn-sm gap-1"
                    >
                        <i className="fa-duotone fa-regular fa-eye"></i>
                        Review
                    </Link>
                    <Link
                        href={`/portal/candidates/${application.candidate_id}`}
                        className="btn btn-ghost btn-sm gap-1"
                    >
                        <i className="fa-duotone fa-regular fa-user"></i>
                    </Link>
                </div>
            </td>
        </tr>
    );
}
