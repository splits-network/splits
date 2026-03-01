'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useStandardList } from '@/hooks/use-standard-list';
import { AdminPageHeader, AdminStatsBanner } from '@/components/shared';
import { createAuthenticatedClient } from '@/lib/api-client';
import { CompanyTable } from './components/company-table';

export default function CompaniesPage() {
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
        sortBy,
        sortOrder,
        handleSort,
        page,
        goToPage,
    } = useStandardList<any>({
        endpoint: '/network/admin/recruiter-companies',
        defaultFilters: { search: '' },
        defaultLimit: 25,
    });

    const stats = [
        { label: 'Companies', value: counts.recruiter_companies ?? 0, icon: 'fa-duotone fa-regular fa-building', color: 'primary' as const },
        { label: 'Recruiters', value: counts.recruiters ?? 0, icon: 'fa-duotone fa-regular fa-users', color: 'secondary' as const },
        { label: 'Pending', value: counts.recruiters_pending ?? 0, icon: 'fa-duotone fa-regular fa-clock', color: 'warning' as const },
    ];

    return (
        <div>
            <AdminPageHeader
                title="Companies"
                subtitle={`${total} total companies`}
            />

            <AdminStatsBanner stats={stats} loading={countsLoading} />

            <div className="flex items-center gap-3 mb-4">
                <label className="input input-sm flex items-center gap-2 flex-1 max-w-sm">
                    <i className="fa-duotone fa-regular fa-magnifying-glass text-base-content/40" />
                    <input
                        type="text"
                        placeholder="Search companies..."
                        className="grow"
                        value={filters.search ?? ''}
                        onChange={(e) => setFilter('search', e.target.value)}
                    />
                </label>
            </div>

            <div className="card bg-base-100 shadow-sm">
                <CompanyTable
                    data={data}
                    loading={loading}
                    sortField={sortBy}
                    sortDir={sortOrder}
                    onSort={handleSort}
                />

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
