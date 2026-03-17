'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useStandardList } from '@/hooks/use-standard-list';
import { AdminPageHeader, AdminStatsBanner } from '@/components/shared';
import { createAuthenticatedClient } from '@/lib/api-client';
import { TicketTable, type TicketRow } from './components/ticket-table';

type Filters = { status: string };

const STATUS_OPTIONS = [
    { label: 'All', value: '' },
    { label: 'Open', value: 'open' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'Closed', value: 'closed' },
];

export default function SupportTicketsPage() {
    const { getToken } = useAuth();
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [countsLoading, setCountsLoading] = useState(true);

    useEffect(() => {
        async function loadCounts() {
            try {
                const token = await getToken();
                if (!token) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get('/support/admin/support/tickets/counts');
                setCounts((res as any).data || res);
            } catch { /* non-critical */ } finally {
                setCountsLoading(false);
            }
        }
        loadCounts();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    } = useStandardList<TicketRow, Filters>({
        endpoint: '/support/admin/support/tickets',
        defaultFilters: { status: '' },
        defaultLimit: 25,
    });

    return (
        <div>
            <AdminPageHeader
                title="Support Tickets"
                subtitle={`${total} ticket${total !== 1 ? 's' : ''}`}
            />

            <AdminStatsBanner
                stats={[
                    { label: 'Open', value: counts.open ?? 0, icon: 'fa-duotone fa-regular fa-circle-exclamation', color: 'warning' },
                    { label: 'In Progress', value: counts.in_progress ?? 0, icon: 'fa-duotone fa-regular fa-spinner', color: 'info' },
                    { label: 'Resolved', value: counts.resolved ?? 0, icon: 'fa-duotone fa-regular fa-circle-check', color: 'success' },
                    { label: 'Closed', value: counts.closed ?? 0, icon: 'fa-duotone fa-regular fa-circle-xmark', color: 'error' },
                ]}
                loading={countsLoading}
            />

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
                        className="input input-sm w-full"
                        placeholder="Search tickets..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>
            </div>

            <div className="card bg-base-100 shadow-sm">
                <TicketTable
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
