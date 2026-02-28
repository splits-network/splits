'use client';

import { AdminDataTable, type Column } from '@/components/shared';

type Placement = {
    id: string;
    candidate_name?: string;
    candidate_id: string;
    job_id: string;
    company_name?: string;
    recruiter_id?: string;
    start_date?: string;
    end_date?: string;
    status: string;
    fee?: number;
    created_at: string;
};

type PlacementTableProps = {
    data: Placement[];
    loading: boolean;
    sortField?: string;
    sortDir?: 'asc' | 'desc';
    onSort: (field: string) => void;
};

const STATUS_BADGE: Record<string, string> = {
    active: 'badge-success',
    pending: 'badge-warning',
    completed: 'badge-info',
    cancelled: 'badge-error',
    guarantee: 'badge-ghost',
};

function formatDate(iso?: string) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatFee(fee?: number) {
    if (!fee) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(fee / 100);
}

export function PlacementTable({ data, loading, sortField, sortDir, onSort }: PlacementTableProps) {
    const columns: Column<Placement>[] = [
        {
            key: 'candidate_name',
            label: 'Candidate',
            render: (item) => (
                <span className="text-sm font-medium">
                    {item.candidate_name ?? (
                        <span className="font-mono text-base-content/50">{item.candidate_id.slice(0, 8)}...</span>
                    )}
                </span>
            ),
        },
        {
            key: 'job_id',
            label: 'Job',
            render: (item) => (
                <span className="font-mono text-sm text-base-content/60">{item.job_id.slice(0, 8)}...</span>
            ),
        },
        {
            key: 'company_name',
            label: 'Company',
            render: (item) => (
                <span className="text-sm text-base-content/70">{item.company_name ?? '—'}</span>
            ),
        },
        {
            key: 'start_date',
            label: 'Start Date',
            sortable: true,
            render: (item) => <span className="text-sm text-base-content/60">{formatDate(item.start_date)}</span>,
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (item) => (
                <span className={`badge badge-sm capitalize ${STATUS_BADGE[item.status] ?? 'badge-ghost'}`}>
                    {item.status}
                </span>
            ),
        },
        {
            key: 'fee',
            label: 'Fee',
            sortable: true,
            render: (item) => <span className="text-sm font-medium">{formatFee(item.fee)}</span>,
        },
    ];

    return (
        <AdminDataTable
            columns={columns}
            data={data}
            loading={loading}
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
            emptyTitle="No placements found"
            emptyDescription="No placements match the current filters."
        />
    );
}
