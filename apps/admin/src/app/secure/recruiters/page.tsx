'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useStandardList } from '@/hooks/use-standard-list';
import { AdminPageHeader, AdminStatsBanner } from '@/components/shared';
import { createAuthenticatedClient } from '@/lib/api-client';
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
    const { getToken } = useAuth();
    const [counts, setCounts] = useState({ recruiters: 0, recruiters_pending: 0, recruiter_companies: 0 });
    const [countsLoading, setCountsLoading] = useState(true);

    useEffect(() => {
        async function fetchCounts() {
            try {
                const token = await getToken();
                if (!token) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get('/network/admin/counts');
                setCounts(res.data);
            } catch {
                // silently fail — stats are non-critical
            } finally {
                setCountsLoading(false);
            }
        }
        fetchCounts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        endpoint: '/network/admin/recruiters',
        defaultFilters: { status: '' },
        defaultLimit: 25,
    });

    return (
        <div>
            <AdminPageHeader
                title="Recruiters"
                subtitle={`${total} recruiter${total !== 1 ? 's' : ''} on the platform`}
            />

            <AdminStatsBanner
                stats={[
                    { label: 'Total Recruiters', value: counts.recruiters, icon: 'fa-duotone fa-regular fa-users', color: 'primary' },
                    { label: 'Pending Approval', value: counts.recruiters_pending, icon: 'fa-duotone fa-regular fa-clock', color: 'warning' },
                    { label: 'Companies', value: counts.recruiter_companies, icon: 'fa-duotone fa-regular fa-building', color: 'secondary' },
                ]}
                loading={countsLoading}
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
