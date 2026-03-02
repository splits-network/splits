'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useStandardList } from '@/hooks/use-standard-list';
import { AdminPageHeader, AdminStatsBanner } from '@/components/shared';
import { createAuthenticatedClient } from '@/lib/api-client';
import { FirmTable } from './components/firm-table';

type MarketplaceStatus = '' | 'pending_approval' | 'approved' | 'not_listed';

type Filters = {
    marketplace_status: MarketplaceStatus;
};

const MARKETPLACE_OPTIONS: { label: string; value: MarketplaceStatus }[] = [
    { label: 'All', value: '' },
    { label: 'Pending Approval', value: 'pending_approval' },
    { label: 'Approved', value: 'approved' },
    { label: 'Not Listed', value: 'not_listed' },
];

export default function FirmsPage() {
    const { getToken } = useAuth();
    const [counts, setCounts] = useState({ firms: 0, firms_pending_approval: 0, firms_marketplace_active: 0 });
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
        endpoint: '/network/admin/firms',
        defaultFilters: { marketplace_status: '' },
        defaultLimit: 25,
    });

    return (
        <div>
            <AdminPageHeader
                title="Firms"
                subtitle={`${total} firm${total !== 1 ? 's' : ''} on the platform`}
            />

            <AdminStatsBanner
                stats={[
                    { label: 'Total Firms', value: counts.firms, icon: 'fa-duotone fa-regular fa-building-columns', color: 'primary' },
                    { label: 'Pending Approval', value: counts.firms_pending_approval, icon: 'fa-duotone fa-regular fa-clock', color: 'warning' },
                    { label: 'Marketplace Active', value: counts.firms_marketplace_active, icon: 'fa-duotone fa-regular fa-store', color: 'success' },
                ]}
                loading={countsLoading}
            />

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                    {MARKETPLACE_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            className={`btn btn-sm ${filters.marketplace_status === opt.value ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setFilter('marketplace_status', opt.value)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
                <div className="flex-1 max-w-xs">
                    <input
                        type="text"
                        className="input input-sm input-bordered w-full"
                        placeholder="Search firms..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="card bg-base-100 shadow-sm">
                <FirmTable
                    data={data}
                    loading={loading}
                    sortField={sortBy}
                    sortDir={sortOrder}
                    onSort={handleSort}
                    onRefresh={() => {
                        refresh();
                        // Re-fetch counts after approval/revoke actions
                        (async () => {
                            try {
                                const token = await getToken();
                                if (!token) return;
                                const client = createAuthenticatedClient(token);
                                const res = await client.get('/network/admin/counts');
                                setCounts(res.data);
                            } catch { /* ignore */ }
                        })();
                    }}
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
