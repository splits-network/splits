'use client';

import { useState } from 'react';
import { AdminDataTable, AdminPageHeader, type Column } from '@/components/shared';
import { useStandardList } from '@/hooks/use-standard-list';
import { PayoutDetailModal } from './payout-detail-modal';

export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'reversed' | 'on_hold';

export type PayoutTransaction = {
    id: string;
    placement_id: string;
    recruiter_id: string;
    recruiter_name?: string;
    recruiter_email?: string;
    amount: number;
    status: PayoutStatus;
    type?: string;
    stripe_transfer_id?: string;
    failure_reason?: string;
    created_at: string;
    updated_at: string;
    completed_at?: string;
};

const STATUS_BADGE: Record<PayoutStatus, string> = {
    pending: 'badge-warning',
    processing: 'badge-info',
    paid: 'badge-success',
    failed: 'badge-error',
    reversed: 'badge-error',
    on_hold: 'badge-ghost',
};

function StatusBadge({ status }: { status: PayoutStatus }) {
    return (
        <span className={`badge badge-sm capitalize ${STATUS_BADGE[status] ?? 'badge-ghost'}`}>
            {status.replace(/_/g, ' ')}
        </span>
    );
}

function AmountCell({ amount }: { amount: number }) {
    const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount / 100);
    return <span className="font-medium text-sm">{formatted}</span>;
}

const COLUMNS: Column<PayoutTransaction>[] = [
    {
        key: 'id',
        label: 'ID',
        render: (p) => <span className="font-mono text-sm text-base-content/60">{p.id.slice(0, 8)}</span>,
    },
    {
        key: 'recruiter_name',
        label: 'Recruiter',
        sortable: true,
        render: (p) => (
            <div>
                <p className="text-sm font-medium">{p.recruiter_name ?? '—'}</p>
                {p.recruiter_email && <p className="text-sm text-base-content/50">{p.recruiter_email}</p>}
            </div>
        ),
    },
    {
        key: 'amount',
        label: 'Amount',
        sortable: true,
        render: (p) => <AmountCell amount={p.amount} />,
    },
    {
        key: 'status',
        label: 'Status',
        render: (p) => <StatusBadge status={p.status} />,
    },
    {
        key: 'type',
        label: 'Type',
        render: (p) => (
            <span className="text-sm text-base-content/70 capitalize">
                {p.type?.replace(/_/g, ' ') ?? '—'}
            </span>
        ),
    },
    {
        key: 'created_at',
        label: 'Created',
        sortable: true,
        render: (p) => (
            <span className="text-sm text-base-content/60">
                {new Date(p.created_at).toLocaleDateString()}
            </span>
        ),
    },
];

type Filters = { status?: PayoutStatus; search: string };

export function PayoutTable() {
    const [selectedPayout, setSelectedPayout] = useState<PayoutTransaction | null>(null);

    const { data: items, loading, filters, totalPages, page, goToPage, setFilter, sortBy, sortOrder, handleSort } =
        useStandardList<PayoutTransaction, Filters>({
            endpoint: '/admin/billing/admin/payouts',
            defaultFilters: { status: 'pending', search: '' },
            defaultLimit: 25,
        });

    return (
        <div>
            <AdminPageHeader title="Payouts" subtitle="Manage payout transactions" />

            <div className="flex items-center gap-3 mb-4 flex-wrap">
                <label className="input input-sm flex items-center gap-2 flex-1 max-w-sm">
                    <i className="fa-duotone fa-regular fa-magnifying-glass text-base-content/40" />
                    <input
                        type="text"
                        placeholder="Search payouts..."
                        className="grow"
                        value={filters.search ?? ''}
                        onChange={(e) => setFilter('search', e.target.value)}
                    />
                </label>
                <select
                    className="select select-sm"
                    value={filters.status ?? ''}
                    onChange={(e) => setFilter('status', e.target.value as PayoutStatus || undefined)}
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="reversed">Reversed</option>
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
                    onRowClick={setSelectedPayout}
                    emptyTitle="No payouts found"
                    emptyDescription="No payouts match your current filters."
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

            <PayoutDetailModal payout={selectedPayout} onClose={() => setSelectedPayout(null)} />
        </div>
    );
}
