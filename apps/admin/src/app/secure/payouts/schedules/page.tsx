'use client';

import Link from 'next/link';
import { AdminDataTable, AdminPageHeader, type Column } from '@/components/shared';
import { useStandardList } from '@/hooks/use-standard-list';


type PayoutSchedule = {
    id: string;
    name: string;
    frequency: string;
    next_run_at?: string;
    last_run_at?: string;
    status: string;
};

const TABS = [
    { label: 'Transactions', href: '/secure/payouts' },
    { label: 'Audit', href: '/secure/payouts/audit' },
    { label: 'Escrow', href: '/secure/payouts/escrow' },
    { label: 'Schedules', href: '/secure/payouts/schedules' },
];

const COLUMNS: Column<PayoutSchedule>[] = [
    {
        key: 'name',
        label: 'Schedule Name',
        render: (s) => <span className="text-sm font-medium">{s.name}</span>,
    },
    {
        key: 'frequency',
        label: 'Frequency',
        render: (s) => <span className="text-sm capitalize text-base-content/70">{s.frequency}</span>,
    },
    {
        key: 'next_run_at',
        label: 'Next Run',
        render: (s) =>
            s.next_run_at ? (
                <span className="text-sm text-base-content/60">
                    {new Date(s.next_run_at).toLocaleDateString()}
                </span>
            ) : (
                <span className="text-base-content/40 text-sm">—</span>
            ),
    },
    {
        key: 'last_run_at',
        label: 'Last Run',
        render: (s) =>
            s.last_run_at ? (
                <span className="text-sm text-base-content/60">
                    {new Date(s.last_run_at).toLocaleDateString()}
                </span>
            ) : (
                <span className="text-base-content/40 text-sm">Never</span>
            ),
    },
    {
        key: 'status',
        label: 'Status',
        render: (s) => (
            <span className={`badge badge-sm capitalize ${s.status === 'active' ? 'badge-success' : 'badge-ghost'}`}>
                {s.status}
            </span>
        ),
    },
];

export default function PayoutSchedulesPage() {
    const { data, loading, sortBy, sortOrder, handleSort } = useStandardList<PayoutSchedule>({
        endpoint: '/billing/admin/schedules',
        defaultFilters: {},
        defaultLimit: 25,
    });

    return (
        <div>
            <div className="tabs tabs-bordered mb-6">
                {TABS.map((tab) => (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`tab ${tab.href === '/secure/payouts/schedules' ? 'tab-active' : ''}`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>

            <AdminPageHeader
                title="Payout Schedules"
                subtitle="Automated payment schedule configurations"
            />

            <div className="card bg-base-100 border border-base-200">
                <AdminDataTable
                    columns={COLUMNS}
                    data={data}
                    loading={loading}
                    sortField={sortBy}
                    sortDir={sortOrder}
                    onSort={handleSort}
                    emptyTitle="No schedules configured"
                    emptyDescription="Payment schedules will appear here once configured."
                />
            </div>
        </div>
    );
}
