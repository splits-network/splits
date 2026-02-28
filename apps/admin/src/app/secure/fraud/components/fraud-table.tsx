'use client';

import { AdminDataTable, type Column } from '@/components/shared';

export type FraudSignal = {
    id: string;
    entity_type: string;
    entity_id: string;
    entity_name: string;
    signal_type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    detected_at: string;
    resolved: boolean;
};

const SEVERITY_BADGE: Record<string, string> = {
    critical: 'badge-error',
    high: 'badge-warning',
    medium: 'badge-info',
    low: 'badge-ghost',
};

const SEVERITY_ICON: Record<string, string> = {
    critical: 'fa-circle-exclamation text-error',
    high: 'fa-triangle-exclamation text-warning',
    medium: 'fa-circle-info text-info',
    low: 'fa-circle text-base-content/40',
};

const COLUMNS: Column<FraudSignal>[] = [
    {
        key: 'severity',
        label: 'Severity',
        sortable: true,
        width: '100px',
        render: (item) => (
            <div className="flex items-center gap-1.5">
                <i className={`fa-duotone fa-regular ${SEVERITY_ICON[item.severity]}`} />
                <span className={`badge badge-sm ${SEVERITY_BADGE[item.severity]}`}>
                    {item.severity}
                </span>
            </div>
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
        key: 'signal_type',
        label: 'Signal Type',
        render: (item) => (
            <span className="badge badge-outline badge-sm">{item.signal_type}</span>
        ),
    },
    {
        key: 'description',
        label: 'Description',
        render: (item) => (
            <span className="text-sm text-base-content/70 line-clamp-2">{item.description}</span>
        ),
    },
    {
        key: 'detected_at',
        label: 'Detected',
        sortable: true,
        render: (item) => (
            <span className="text-sm text-base-content/60">
                {new Date(item.detected_at).toLocaleDateString()}
            </span>
        ),
    },
    {
        key: 'resolved',
        label: 'Status',
        render: (item) => (
            <span className={`badge badge-sm ${item.resolved ? 'badge-success' : 'badge-error'}`}>
                {item.resolved ? 'Resolved' : 'Active'}
            </span>
        ),
    },
];

type FraudTableProps = {
    data: FraudSignal[];
    loading?: boolean;
    sortField?: string;
    sortDir?: 'asc' | 'desc';
    onSort?: (field: string) => void;
};

export function FraudTable({ data, loading, sortField, sortDir, onSort }: FraudTableProps) {
    return (
        <AdminDataTable
            columns={COLUMNS}
            data={data}
            loading={loading}
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
            emptyTitle="No fraud signals"
            emptyDescription="No fraud signals have been detected."
        />
    );
}
