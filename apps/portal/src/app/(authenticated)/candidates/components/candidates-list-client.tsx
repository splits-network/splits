'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useStandardList } from '@/hooks/use-standard-list';
import { useUserProfile } from '@/contexts';
import { formatDate, getVerificationStatusBadge, getVerificationStatusIcon } from '@/lib/utils';
import CandidateCard from './candidate-card';
import AddCandidateModal from './add-candidate-modal';

interface Candidate {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    linkedin_url?: string;
    portfolio_url?: string;
    github_url?: string;
    verification_status?: string;
    is_sourcer?: boolean;
    has_active_relationship?: boolean;
    is_new?: boolean;
    has_other_active_recruiters?: boolean;
    other_active_recruiters_count?: number;
    created_at: string;
}

interface CandidateFilters {
    scope: 'mine' | 'all';
}

export default function CandidatesListClient() {
    const { getToken } = useAuth();
    const { isRecruiter } = useUserProfile();
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchCandidates = async (params: Record<string, any>) => {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const client = createAuthenticatedClient(token);
        const response = await client.get('/candidates', { params });

        return {
            data: response.data || [],
            pagination: response.pagination || { total: 0, page: 1, limit: 25, total_pages: 0 }
        };
    };

    const {
        data: candidates,
        loading,
        error,
        pagination,
        filters,
        searchQuery,
        sortBy,
        sortOrder,
        viewMode,
        setFilters,
        handleSearch,
        handlePageChange,
        handleSort,
        handleSortChange,
        setViewMode,
        handleLimitChange,
        refetch
    } = useStandardList<Candidate, CandidateFilters>({
        fetchFn: fetchCandidates,
        defaultFilters: { scope: 'mine' },
        defaultSortBy: 'created_at',
        defaultSortOrder: 'desc',
        storageKey: 'candidatesViewMode'
    });

    const handleAddCandidateSuccess = (newCandidate: Candidate) => {
        refetch();
    };

    // Sort icon helper for table headers
    const getSortIcon = (field: string) => {
        if (sortBy !== field) return 'fa-sort';
        return sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    };

    if (loading && candidates.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg"></span>
                    <p className="mt-4 text-base-content/70">Loading candidates...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{error}</span>
                <button className="btn btn-sm btn-ghost" onClick={refetch}>
                    <i className="fa-solid fa-rotate"></i>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Candidates</h1>
                    <p className="text-base-content/70 mt-1">
                        View and manage all your submitted candidates
                    </p>
                </div>
                <button
                    className="btn btn-primary gap-2"
                    onClick={() => setShowAddModal(true)}
                >
                    <i className="fa-solid fa-plus"></i>
                    New Candidate
                </button>
            </div>

            {/* Filters and View Toggle */}
            <div className="card bg-base-100 shadow">
                <div className="card-body p-4">
                    <div className="flex flex-wrap gap-4 items-end">
                        {/* Scope Filter - Only show for recruiters */}
                        {isRecruiter && (
                            <div className="fieldset">
                                <select
                                    className="select"
                                    value={filters.scope}
                                    onChange={(e) => setFilters({ scope: e.target.value as 'mine' | 'all' })}
                                >
                                    <option value="mine">My Candidates</option>
                                    <option value="all">All Candidates</option>
                                </select>
                            </div>
                        )}

                        {/* Search */}
                        <div className="fieldset flex-1">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="input w-full"
                                defaultValue={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        {/* Sort dropdown for grid view */}
                        {viewMode === 'grid' && (
                            <div className="fieldset">
                                <select
                                    className="select"
                                    value={`${sortBy}-${sortOrder}`}
                                    onChange={(e) => {
                                        const [field, order] = e.target.value.split('-');
                                        handleSortChange(field, order as 'asc' | 'desc');
                                    }}
                                >
                                    <option value="created_at-desc">Newest First</option>
                                    <option value="created_at-asc">Oldest First</option>
                                    <option value="full_name-asc">Name (A-Z)</option>
                                    <option value="full_name-desc">Name (Z-A)</option>
                                    <option value="email-asc">Email (A-Z)</option>
                                    <option value="email-desc">Email (Z-A)</option>
                                </select>
                            </div>
                        )}

                        {/* View Mode Toggle */}
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

            {/* Loading overlay for subsequent fetches */}
            {loading && candidates.length > 0 && (
                <div className="flex justify-center py-4">
                    <span className="loading loading-spinner loading-md"></span>
                </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && candidates.length > 0 && (
                <div className="columns-1 lg:columns-2 xl:columns-3 gap-6 space-y-6">
                    {candidates.map((candidate) => (
                        <div key={candidate.id} className="break-inside-avoid mb-6">
                            <CandidateCard candidate={candidate} />
                        </div>
                    ))}
                </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && candidates.length > 0 && (
                <div className="card bg-base-100 shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th
                                        className="cursor-pointer hover:bg-base-200 select-none"
                                        onClick={() => handleSort('full_name')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Candidate
                                            <i className={`fa-solid ${getSortIcon('full_name')} text-xs opacity-50`}></i>
                                        </div>
                                    </th>
                                    <th
                                        className="cursor-pointer hover:bg-base-200 select-none"
                                        onClick={() => handleSort('email')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Email
                                            <i className={`fa-solid ${getSortIcon('email')} text-xs opacity-50`}></i>
                                        </div>
                                    </th>
                                    <th
                                        className="cursor-pointer hover:bg-base-200 select-none"
                                        onClick={() => handleSort('verification_status')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Status
                                            <i className={`fa-solid ${getSortIcon('verification_status')} text-xs opacity-50`}></i>
                                        </div>
                                    </th>
                                    {isRecruiter && <th>Relationship</th>}
                                    <th>Links</th>
                                    <th
                                        className="cursor-pointer hover:bg-base-200 select-none"
                                        onClick={() => handleSort('created_at')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Added
                                            <i className={`fa-solid ${getSortIcon('created_at')} text-xs opacity-50`}></i>
                                        </div>
                                    </th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {candidates.map((candidate) => (
                                    <tr key={candidate.id} className="hover">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="avatar avatar-placeholder">
                                                    <div className="bg-primary/10 text-primary rounded-full w-10">
                                                        <span className="text-sm">
                                                            {(() => {
                                                                const names = candidate.full_name.split(' ');
                                                                const firstInitial = names[0]?.[0]?.toUpperCase() || '';
                                                                const lastInitial = names[names.length - 1]?.[0]?.toUpperCase() || '';
                                                                return names.length > 1 ? firstInitial + lastInitial : firstInitial;
                                                            })()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Link href={`/candidates/${candidate.id}`} className="font-semibold hover:text-primary transition-colors">
                                                    {candidate.full_name}
                                                </Link>
                                            </div>
                                        </td>
                                        <td>
                                            <a href={`mailto:${candidate.email}`} className="link link-hover text-sm">
                                                {candidate.email}
                                            </a>
                                        </td>
                                        <td>
                                            {candidate.verification_status && (
                                                <span className={`badge badge-sm ${getVerificationStatusBadge(candidate.verification_status)} gap-1`}>
                                                    <i className={`fa-solid ${getVerificationStatusIcon(candidate.verification_status)}`}></i>
                                                    {candidate.verification_status.charAt(0).toUpperCase() + candidate.verification_status.slice(1)}
                                                </span>
                                            )}
                                        </td>
                                        {isRecruiter && (
                                            <td>
                                                <div className="flex gap-1">
                                                    {candidate.is_sourcer && (
                                                        <span className="badge badge-sm badge-primary gap-1" title="You sourced this candidate">
                                                            <i className="fa-solid fa-star"></i>
                                                            Sourcer
                                                        </span>
                                                    )}
                                                    {candidate.has_active_relationship && (
                                                        <span className="badge badge-sm badge-success gap-1" title="Active relationship">
                                                            <i className="fa-solid fa-handshake"></i>
                                                            Active
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                        <td>
                                            <div className="flex gap-1">
                                                {candidate.linkedin_url && (
                                                    <a
                                                        href={candidate.linkedin_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-ghost btn-sm"
                                                        title="View LinkedIn Profile"
                                                    >
                                                        <i className="fa-brands fa-linkedin text-blue-600"></i>
                                                    </a>
                                                )}
                                                {candidate.portfolio_url && (
                                                    <a
                                                        href={candidate.portfolio_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-ghost btn-sm"
                                                        title="View Portfolio"
                                                    >
                                                        <i className="fa-solid fa-globe text-purple-600"></i>
                                                    </a>
                                                )}
                                                {candidate.github_url && (
                                                    <a
                                                        href={candidate.github_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-ghost btn-sm"
                                                        title="View GitHub"
                                                    >
                                                        <i className="fa-brands fa-github text-gray-600"></i>
                                                    </a>
                                                )}
                                                {!candidate.linkedin_url && !candidate.portfolio_url && !candidate.github_url && (
                                                    <span className="text-base-content/40">—</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-sm text-base-content/70">
                                            {formatDate(candidate.created_at)}
                                        </td>
                                        <td>
                                            <div className="flex gap-2 justify-end">
                                                <Link
                                                    href={`/candidates/${candidate.id}`}
                                                    className="btn btn-primary btn-sm"
                                                    title="View Details"
                                                >
                                                    <i className="fa-solid fa-arrow-right"></i>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {candidates.length === 0 && !loading && (
                <div className="card bg-base-100 shadow">
                    <div className="card-body text-center py-12">
                        <i className="fa-solid fa-users text-6xl text-base-content/20"></i>
                        <h3 className="text-xl font-semibold mt-4">No Candidates Found</h3>
                        <p className="text-base-content/70 mt-2">
                            {searchQuery ? 'Try adjusting your search' : 'Submit candidates to roles to see them appear here'}
                        </p>
                        {!searchQuery && (
                            <button
                                className="btn btn-primary mt-4"
                                onClick={() => setShowAddModal(true)}
                            >
                                <i className="fa-solid fa-plus"></i>
                                Add Your First Candidate
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Pagination Controls */}
            {pagination.total_pages > 1 && (
                <div className="card bg-base-100 shadow">
                    <div className="card-body p-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Results info */}
                            <div className="text-sm text-base-content/70">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} candidates
                            </div>

                            {/* Pagination buttons */}
                            <div className="join">
                                <button
                                    className="join-item btn btn-sm"
                                    onClick={() => handlePageChange(1)}
                                    disabled={pagination.page === 1}
                                    title="First page"
                                >
                                    <i className="fa-solid fa-angles-left"></i>
                                </button>
                                <button
                                    className="join-item btn btn-sm"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    title="Previous page"
                                >
                                    <i className="fa-solid fa-angle-left"></i>
                                </button>

                                {/* Page numbers */}
                                {(() => {
                                    const pagesSet = new Set<number>();
                                    const current = pagination.page;
                                    const total = pagination.total_pages;

                                    if (current > 3) pagesSet.add(1);
                                    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
                                        pagesSet.add(i);
                                    }
                                    if (current < total - 2) pagesSet.add(total);

                                    const sortedPages = Array.from(pagesSet).sort((a, b) => a - b);
                                    const pages: (number | string)[] = [];

                                    for (let i = 0; i < sortedPages.length; i++) {
                                        if (i > 0 && sortedPages[i] - sortedPages[i - 1] > 1) {
                                            pages.push(`ellipsis-${i}`);
                                        }
                                        pages.push(sortedPages[i]);
                                    }

                                    return pages.map((page) => {
                                        if (typeof page === 'string') {
                                            return <span key={page} className="join-item btn btn-sm btn-disabled">...</span>;
                                        }
                                        return (
                                            <button
                                                key={page}
                                                className={`join-item btn btn-sm ${pagination.page === page ? 'btn-primary' : ''}`}
                                                onClick={() => handlePageChange(page)}
                                            >
                                                {page}
                                            </button>
                                        );
                                    });
                                })()}

                                <button
                                    className="join-item btn btn-sm"
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.total_pages}
                                    title="Next page"
                                >
                                    <i className="fa-solid fa-angle-right"></i>
                                </button>
                                <button
                                    className="join-item btn btn-sm"
                                    onClick={() => handlePageChange(pagination.total_pages)}
                                    disabled={pagination.page === pagination.total_pages}
                                    title="Last page"
                                >
                                    <i className="fa-solid fa-angles-right"></i>
                                </button>
                            </div>

                            {/* Page size selector */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-base-content/70">Per page:</span>
                                <select
                                    className="select select-sm"
                                    value={pagination.limit}
                                    onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Candidate Modal */}
            <AddCandidateModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={handleAddCandidateSuccess}
            />
        </div>
    );
}
