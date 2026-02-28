'use client';

import { useStandardList } from '@/hooks/use-standard-list';
import { AdminPageHeader } from '@/components/shared';
import { RecruiterTable } from './components/recruiter-table';

type RecruiterStatus = 'pending' | 'active' | 'suspended' | '';

type Filters = {
    status: RecruiterStatus;
};

const STATUS_OPTIONS: { label: string; value: RecruiterStatus }[] = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Active', value: 'active' },
    { label: 'Suspended', value: 'suspended' },
];

export default function RecruitersPage() {
    const {
        data,
        total,
        totalPages,
        loading,
        filters,
        setFilter,
        searchInput,
        setSearchInput,
        sortBy,
        sortOrder,
        handleSort,
        page,
        goToPage,
        refresh,
    } = useStandardList<any, Filters>({
        endpoint: '/admin/network/admin/recruiters',
        defaultFilters: { status: '' },
        defaultLimit: 25,
    });

    return (
        <div>
            <AdminPageHeader
                title="Recruiters"
                subtitle={`${total} recruiter${total !== 1 ? 's' : ''} on the platform`}
            />

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                    {STATUS_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            className={`btn btn-sm ${filters.status === opt.value ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setFilter('status', opt.value)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
                <div className="flex-1 max-w-xs">
                    <input
                        type="text"
                        className="input input-sm input-bordered w-full"
                        placeholder="Search recruiters..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="card bg-base-100 shadow-sm">
                <RecruiterTable
                    data={data}
                    loading={loading}
                    sortField={sortBy}
                    sortDir={sortOrder}
                    onSort={handleSort}
                    onRefresh={refresh}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-base-200">
                        <span className="text-sm text-base-content/60">
                            Page {page} of {totalPages}
                        </span>
                        <div className="join">
                            <button
                                type="button"
                                className="join-item btn btn-sm"
                                disabled={page <= 1}
                                onClick={() => goToPage(page - 1)}
                            >
                                <i className="fa-duotone fa-regular fa-chevron-left" />
                            </button>
                            <button
                                type="button"
                                className="join-item btn btn-sm"
                                disabled={page >= totalPages}
                                onClick={() => goToPage(page + 1)}
                            >
                                <i className="fa-duotone fa-regular fa-chevron-right" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
