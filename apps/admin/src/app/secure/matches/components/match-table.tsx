'use client';

import { useRouter } from 'next/navigation';
import { AdminDataTable, type Column } from '@/components/shared';

export type MatchRow = {
    id: string;
    candidate_name: string;
    job_title: string;
    company: string;
    score: number;
    status: string;
    created_at: string;
};

const SCORE_COLOR = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
};

const STATUS_BADGE: Record<string, string> = {
    pending: 'badge-warning',
    accepted: 'badge-success',
    rejected: 'badge-error',
    expired: 'badge-ghost',
};

const COLUMNS: Column<MatchRow>[] = [
    {
        key: 'candidate_name',
        label: 'Candidate',
        sortable: true,
    },
    {
        key: 'job_title',
        label: 'Job',
        sortable: true,
    },
    {
        key: 'company',
        label: 'Company',
        sortable: true,
    },
    {
        key: 'score',
        label: 'Score',
        sortable: true,
        render: (item) => (
            <div className="flex items-center gap-2 min-w-24">
                <progress
                    className={`progress w-16 ${item.score >= 80 ? 'progress-success' : item.score >= 60 ? 'progress-warning' : 'progress-error'}`}
                    value={item.score}
                    max={100}
                />
                <span className={`text-sm font-semibold ${SCORE_COLOR(item.score)}`}>
                    {item.score}%
                </span>
            </div>
        ),
    },
    {
        key: 'status',
        label: 'Status',
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
            <span className="text-sm text-base-content/60">
                {new Date(item.created_at).toLocaleDateString()}
            </span>
        ),
    },
];

type MatchTableProps = {
    data: MatchRow[];
    loading?: boolean;
    sortField?: string;
    sortDir?: 'asc' | 'desc';
    onSort?: (field: string) => void;
};

export function MatchTable({ data, loading, sortField, sortDir, onSort }: MatchTableProps) {
    const router = useRouter();

    return (
        <AdminDataTable
            columns={COLUMNS}
            data={data}
            loading={loading}
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
            onRowClick={(item) => router.push(`/secure/matches/${item.id}`)}
            emptyTitle="No matches found"
            emptyDescription="Matches will appear once the matching engine runs."
        />
    );
}
