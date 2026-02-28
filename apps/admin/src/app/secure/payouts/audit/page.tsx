'use client';

import Link from 'next/link';
import { AdminDataTable, AdminPageHeader, type Column } from '@/components/shared';
import { useStandardList } from '@/hooks/use-standard-list';

type AuditEntry = {
    id: string;
    payout_id: string;
    action: string;
    actor: string;
    details?: string;
    created_at: string;
};

const TABS = [
    { label: 'Transactions', href: '/secure/payouts' },
    { label: 'Audit', href: '/secure/payouts/audit' },
    { label: 'Escrow', href: '/secure/payouts/escrow' },
    { label: 'Schedules', href: '/secure/payouts/schedules' },
];

const COLUMNS: Column<AuditEntry>[] = [
    {
        key: 'action',
        label: 'Action',
        render: (e) => (
            <span className="badge badge-ghost badge-sm capitalize">
                {e.action.replace(/_/g, ' ')}
            </span>
        ),
    },
    {
        key: 'payout_id',
        label: 'Payout ID',
        render: (e) => <span className="font-mono text-sm text-base-content/60">{e.payout_id.slice(0, 8)}</span>,
    },
    {
        key: 'actor',
        label: 'Actor',
        render: (e) => <span className="text-sm">{e.actor}</span>,
    },
    {
        key: 'details',
        label: 'Details',
        render: (e) => <span className="text-sm text-base-content/60">{e.details ?? '—'}</span>,
    },
    {
        key: 'created_at',
        label: 'Timestamp',
        sortable: true,
        render: (e) => (
            <span className="text-sm text-base-content/60">
                {new Date(e.created_at).toLocaleString()}
            </span>
        ),
    },
];

export default function PayoutAuditPage() {
    const { data, loading, sortBy, sortOrder, handleSort } = useStandardList<AuditEntry>({
        endpoint: '/billing/admin/payouts/audit',
        defaultFilters: {},
        defaultLimit: 50,
    });

    return (
        <div>
            <div className="tabs tabs-bordered mb-6">
                {TABS.map((tab) => (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`tab ${tab.href === '/secure/payouts/audit' ? 'tab-active' : ''}`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>

            <AdminPageHeader
                title="Payout Audit"
                subtitle="Audit trail of payout actions"
            />

            <div className="card bg-base-100 border border-base-200">
                <AdminDataTable
                    columns={COLUMNS}
                    data={data}
                    loading={loading}
                    sortField={sortBy}
                    sortDir={sortOrder}
                    onSort={handleSort}
                    emptyTitle="No audit entries"
                    emptyDescription="No payout audit entries found."
                />
            </div>
        </div>
    );
}
