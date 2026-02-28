'use client';

import { AdminDataTable, type Column } from '@/components/shared';

export type DecisionLogEntry = {
    id: string;
    decision_type: string;
    entity_type: string;
    entity_id: string;
    entity_name: string;
    outcome: string;
    confidence: number;
    reasoning: string;
    decided_at: string;
    decided_by: string;
};

const OUTCOME_BADGE: Record<string, string> = {
    approved: 'badge-success',
    rejected: 'badge-error',
    flagged: 'badge-warning',
    escalated: 'badge-info',
    pending: 'badge-ghost',
};

const CONFIDENCE_COLOR = (confidence: number) => {
    if (confidence >= 0.8) return 'progress-success';
    if (confidence >= 0.6) return 'progress-warning';
    return 'progress-error';
};

const COLUMNS: Column<DecisionLogEntry>[] = [
    {
        key: 'decided_at',
        label: 'Date',
        sortable: true,
        render: (item) => (
            <span className="text-sm text-base-content/60">
                {new Date(item.decided_at).toLocaleDateString()}
            </span>
        ),
    },
    {
        key: 'decision_type',
        label: 'Decision',
        sortable: true,
        render: (item) => (
            <span className="badge badge-outline badge-sm">{item.decision_type}</span>
        ),
    },
    {
        key: 'entity_name',
        label: 'Entity',
        sortable: true,
        render: (item) => (
            <div>
                <p className="font-semibold text-sm">{item.entity_name}</p>
                <p className="text-sm text-base-content/50">{item.entity_type}</p>
            </div>
        ),
    },
    {
        key: 'outcome',
        label: 'Outcome',
        render: (item) => (
            <span className={`badge badge-sm ${OUTCOME_BADGE[item.outcome] ?? 'badge-ghost'}`}>
                {item.outcome}
            </span>
        ),
    },
    {
        key: 'confidence',
        label: 'Confidence',
        sortable: true,
        render: (item) => (
            <div className="flex items-center gap-2 min-w-24">
                <progress
                    className={`progress w-14 ${CONFIDENCE_COLOR(item.confidence)}`}
                    value={item.confidence * 100}
                    max={100}
                />
                <span className="text-sm font-semibold">
                    {Math.round(item.confidence * 100)}%
                </span>
            </div>
        ),
    },
    {
        key: 'decided_by',
        label: 'By',
        render: (item) => (
            <span className="text-sm text-base-content/60">{item.decided_by}</span>
        ),
    },
];

type DecisionTableProps = {
    data: DecisionLogEntry[];
    loading?: boolean;
    sortField?: string;
    sortDir?: 'asc' | 'desc';
    onSort?: (field: string) => void;
};

export function DecisionTable({ data, loading, sortField, sortDir, onSort }: DecisionTableProps) {
    return (
        <AdminDataTable
            columns={COLUMNS}
            data={data}
            loading={loading}
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
            emptyTitle="No decisions logged"
            emptyDescription="Automated decisions will appear here as the system processes data."
        />
    );
}
