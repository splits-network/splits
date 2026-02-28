'use client';

import { AdminDataTable, type Column } from '@/components/shared';

export type ReputationRecord = {
    id: string;
    entity_type: string;
    entity_name: string;
    score: number;
    tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'new';
    total_reviews: number;
    positive_rate: number;
    last_updated: string;
};

const TIER_BADGE: Record<string, string> = {
    platinum: 'badge-primary',
    gold: 'badge-warning',
    silver: 'badge-ghost',
    bronze: 'badge-error',
    new: 'badge-info',
};

const TIER_ICON: Record<string, string> = {
    platinum: 'fa-gem text-primary',
    gold: 'fa-trophy text-warning',
    silver: 'fa-medal text-base-content/40',
    bronze: 'fa-medal text-orange-600',
    new: 'fa-star text-info',
};

const SCORE_COLOR = (score: number) => {
    if (score >= 80) return 'progress-success';
    if (score >= 60) return 'progress-warning';
    return 'progress-error';
};

const COLUMNS: Column<ReputationRecord>[] = [
    {
        key: 'entity_name',
        label: 'Entity',
        sortable: true,
        render: (item) => (
            <div className="flex items-center gap-2">
                <i className={`fa-duotone fa-regular ${TIER_ICON[item.tier]}`} />
                <div>
                    <p className="font-semibold text-sm">{item.entity_name}</p>
                    <p className="text-sm text-base-content/50">{item.entity_type}</p>
                </div>
            </div>
        ),
    },
    {
        key: 'tier',
        label: 'Tier',
        sortable: true,
        render: (item) => (
            <span className={`badge badge-sm ${TIER_BADGE[item.tier]}`}>
                {item.tier}
            </span>
        ),
    },
    {
        key: 'score',
        label: 'Score',
        sortable: true,
        render: (item) => (
            <div className="flex items-center gap-2 min-w-28">
                <progress
                    className={`progress w-16 ${SCORE_COLOR(item.score)}`}
                    value={item.score}
                    max={100}
                />
                <span className="text-sm font-bold">{item.score}</span>
            </div>
        ),
    },
    {
        key: 'positive_rate',
        label: 'Positive Rate',
        sortable: true,
        render: (item) => (
            <span className="text-sm font-semibold text-success">
                {Math.round(item.positive_rate * 100)}%
            </span>
        ),
    },
    {
        key: 'total_reviews',
        label: 'Reviews',
        sortable: true,
        render: (item) => (
            <span className="text-sm font-semibold">{item.total_reviews.toLocaleString()}</span>
        ),
    },
    {
        key: 'last_updated',
        label: 'Updated',
        sortable: true,
        render: (item) => (
            <span className="text-sm text-base-content/60">
                {new Date(item.last_updated).toLocaleDateString()}
            </span>
        ),
    },
];

type ReputationTableProps = {
    data: ReputationRecord[];
    loading?: boolean;
    sortField?: string;
    sortDir?: 'asc' | 'desc';
    onSort?: (field: string) => void;
};

export function ReputationTable({ data, loading, sortField, sortDir, onSort }: ReputationTableProps) {
    return (
        <AdminDataTable
            columns={COLUMNS}
            data={data}
            loading={loading}
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
            emptyTitle="No reputation records"
            emptyDescription="Entity reputation scores will appear as reviews are collected."
        />
    );
}
