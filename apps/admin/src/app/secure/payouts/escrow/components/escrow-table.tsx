'use client';

import { useState } from 'react';
import { AdminDataTable, AdminPageHeader, type Column } from '@/components/shared';
import { useStandardList } from '@/hooks/use-standard-list';
import { ReleaseModal } from './release-modal';

export type EscrowHold = {
    id: string;
    payout_id?: string;
    placement_id: string;
    hold_amount: number;
    hold_reason: 'guarantee_period' | 'dispute' | 'verification' | 'other';
    release_scheduled_date: string;
    status: 'active' | 'released' | 'cancelled';
    released_at?: string;
    created_at: string;
    updated_at: string;
};

type Filters = { status?: string; search: string };

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100);
}

const STATUS_BADGE: Record<string, string> = {
    active: 'badge-warning',
    released: 'badge-success',
    cancelled: 'badge-ghost',
};

const COLUMNS: Column<EscrowHold>[] = [
    {
        key: 'id',
        label: 'Escrow ID',
        render: (h) => <span className="font-mono text-sm text-base-content/60">{h.id.slice(0, 8)}</span>,
    },
    {
        key: 'placement_id',
        label: 'Placement',
        render: (h) => <span className="font-mono text-sm text-base-content/60">{h.placement_id.slice(0, 8)}</span>,
    },
    {
        key: 'hold_amount',
        label: 'Amount',
        sortable: true,
        render: (h) => <span className="font-medium text-sm">{formatCurrency(h.hold_amount)}</span>,
    },
    {
        key: 'status',
        label: 'Status',
        render: (h) => (
            <span className={`badge badge-sm capitalize ${STATUS_BADGE[h.status] ?? 'badge-ghost'}`}>
                {h.status}
            </span>
        ),
    },
    {
        key: 'hold_reason',
        label: 'Reason',
        render: (h) => (
            <span className="text-sm text-base-content/70 capitalize">
                {h.hold_reason.replace(/_/g, ' ')}
            </span>
        ),
    },
    {
        key: 'created_at',
        label: 'Hold Date',
        sortable: true,
        render: (h) => (
            <span className="text-sm text-base-content/60">
                {new Date(h.created_at).toLocaleDateString()}
            </span>
        ),
    },
    {
        key: 'release_scheduled_date',
        label: 'Release Date',
        render: (h) => (
            <span className="text-sm text-base-content/60">
                {new Date(h.release_scheduled_date).toLocaleDateString()}
            </span>
        ),
    },
];

export function EscrowTable() {
    const [holdToRelease, setHoldToRelease] = useState<EscrowHold | null>(null);

    const { data: items, loading, filters, totalPages, page, goToPage, setFilter, sortBy, sortOrder, handleSort, refresh } =
        useStandardList<EscrowHold, Filters>({
            endpoint: '/billing/admin/escrow',
            defaultFilters: { status: 'active', search: '' },
            defaultLimit: 25,
        });

    return (
        <div>
            <AdminPageHeader title="Escrow Holds" subtitle="Manage active escrow holds" />

            <div className="flex items-center gap-3 mb-4 flex-wrap">
                <label className="input input-sm flex items-center gap-2 flex-1 max-w-sm">
                    <i className="fa-duotone fa-regular fa-magnifying-glass text-base-content/40" />
                    <input
                        type="text"
                        placeholder="Search escrow..."
                        className="grow"
                        value={filters.search ?? ''}
                        onChange={(e) => setFilter('search', e.target.value)}
                    />
                </label>
                <select className="select select-sm" value={filters.status ?? ''} onChange={(e) => setFilter('status', e.target.value || undefined)}>
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="released">Released</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            <div className="card bg-base-100 border border-base-200">
                <AdminDataTable
                    columns={COLUMNS}
                    data={items}
                    loading={loading}
                    sortField={sortBy}
                    sortDir={sortOrder}
                    onSort={handleSort}
                    actions={(hold) =>
                        hold.status === 'active' ? (
                            <button type="button" className="btn btn-xs btn-warning" onClick={() => setHoldToRelease(hold)}>
                                Release
                            </button>
                        ) : null
                    }
                    emptyTitle="No escrow holds"
                    emptyDescription="No escrow holds match your current filters."
                />
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    <div className="join">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button key={p} className={`join-item btn btn-sm ${p === page ? 'btn-active' : ''}`} onClick={() => goToPage(p)}>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <ReleaseModal
                hold={holdToRelease}
                onClose={() => setHoldToRelease(null)}
                onReleased={() => {
                    setHoldToRelease(null);
                    refresh();
                }}
            />
        </div>
    );
}
