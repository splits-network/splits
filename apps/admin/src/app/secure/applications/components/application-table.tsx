'use client';

import { AdminDataTable, type Column } from '@/components/shared';

type Application = {
    id: string;
    stage: string | null;
    candidate?: {
        id: string;
        full_name: string;
        email: string;
    } | null;
    job?: {
        id: string;
        title: string;
    } | null;
    created_at: string;
};

type ApplicationTableProps = {
    data: Application[];
    loading: boolean;
    sortField?: string;
    sortDir?: 'asc' | 'desc';
    onSort: (field: string) => void;
};

const STAGE_BADGE: Record<string, string> = {
    ai_review: 'badge-info',
    ai_reviewed: 'badge-info',
    recruiter_request: 'badge-warning',
    recruiter_proposed: 'badge-warning',
    recruiter_review: 'badge-warning',
    submitted: 'badge-info',
    screening: 'badge-warning',
    company_review: 'badge-accent',
    interview: 'badge-warning',
    offer: 'badge-primary',
    hired: 'badge-success',
    placed: 'badge-success',
    rejected: 'badge-error',
    withdrawn: 'badge-ghost',
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function ApplicationTable({ data, loading, sortField, sortDir, onSort }: ApplicationTableProps) {
    const columns: Column<Application>[] = [
        {
            key: 'candidate',
            label: 'Candidate',
            render: (item) => item.candidate ? (
                <div>
                    <p className="font-medium text-sm">
                        {item.candidate.full_name}
                    </p>
                    <p className="text-sm text-base-content/50">{item.candidate.email}</p>
                </div>
            ) : (
                <span className="text-base-content/40 text-sm italic">Unknown</span>
            ),
        },
        {
            key: 'job',
            label: 'Job',
            render: (item) => (
                <span className="text-sm font-medium">
                    {item.job?.title ?? (
                        <span className="text-base-content/40 italic">Unknown Job</span>
                    )}
                </span>
            ),
        },
        {
            key: 'stage',
            label: 'Stage',
            sortable: true,
            render: (item) => item.stage ? (
                <span className={`badge badge-sm capitalize ${STAGE_BADGE[item.stage] ?? 'badge-ghost'}`}>
                    {item.stage.replace(/_/g, ' ')}
                </span>
            ) : (
                <span className="text-base-content/40 text-sm">—</span>
            ),
        },
        {
            key: 'created_at',
            label: 'Applied',
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
            emptyTitle="No applications found"
            emptyDescription="No applications match the current filters."
        />
    );
}
