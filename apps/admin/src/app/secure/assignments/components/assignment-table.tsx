'use client';

import { AdminDataTable, type Column } from '@/components/shared';

type Assignment = {
    id: string;
    recruiter_id: string;
    job_id: string;
    status: string;
    created_at: string;
    job?: {
        id: string;
        title: string;
    };
};

type AssignmentTableProps = {
    data: Assignment[];
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
    inactive: 'badge-ghost',
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function AssignmentTable({
    data,
    loading,
    sortField,
    sortDir,
    onSort,
}: AssignmentTableProps) {
    const columns: Column<Assignment>[] = [
        {
            key: 'recruiter_id',
            label: 'Recruiter',
            render: (item) => (
                <span className="font-mono text-sm text-base-content/70">
                    {item.recruiter_id.slice(0, 12)}...
                </span>
            ),
        },
        {
            key: 'job',
            label: 'Job Title',
            render: (item) => (
                <span className="text-sm font-medium">
                    {item.job?.title ?? (
                        <span className="text-base-content/40 italic">Unknown Job</span>
                    )}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (item) => (
                <span className={`badge badge-sm ${STATUS_BADGE[item.status] ?? 'badge-ghost'}`}>
                    {item.status}
                </span>
            ),
        },
        {
            key: 'created_at',
            label: 'Created',
            sortable: true,
            render: (item) => (
                <span className="text-sm text-base-content/60">{formatDate(item.created_at)}</span>
            ),
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
            emptyTitle="No assignments found"
            emptyDescription="No assignments match the current filters."
        />
    );
}
