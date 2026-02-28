'use client';

import { AdminDataTable, type Column } from '@/components/shared';

export type OwnershipRecord = {
    id: string;
    entity_type: string;
    entity_name: string;
    owner_name: string;
    owner_type: string;
    verification_status: 'verified' | 'pending' | 'disputed' | 'failed';
    verified_at: string | null;
    created_at: string;
};

const STATUS_BADGE: Record<string, string> = {
    verified: 'badge-success',
    pending: 'badge-warning',
    disputed: 'badge-error',
    failed: 'badge-error',
};

const STATUS_ICON: Record<string, string> = {
    verified: 'fa-circle-check text-success',
    pending: 'fa-clock text-warning',
    disputed: 'fa-triangle-exclamation text-error',
    failed: 'fa-circle-xmark text-error',
};

const COLUMNS: Column<OwnershipRecord>[] = [
    {
        key: 'verification_status',
        label: 'Status',
        sortable: true,
        width: '110px',
        render: (item) => (
            <div className="flex items-center gap-1.5">
                <i className={`fa-duotone fa-regular ${STATUS_ICON[item.verification_status]}`} />
                <span className={`badge badge-sm ${STATUS_BADGE[item.verification_status]}`}>
                    {item.verification_status}
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
        key: 'owner_name',
        label: 'Owner',
        sortable: true,
        render: (item) => (
            <div>
                <p className="font-semibold text-sm">{item.owner_name}</p>
                <p className="text-sm text-base-content/50">{item.owner_type}</p>
            </div>
        ),
    },
    {
        key: 'verified_at',
        label: 'Verified',
        sortable: true,
        render: (item) => (
            <span className="text-sm text-base-content/60">
                {item.verified_at ? new Date(item.verified_at).toLocaleDateString() : '—'}
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

type OwnershipTableProps = {
    data: OwnershipRecord[];
    loading?: boolean;
    sortField?: string;
    sortDir?: 'asc' | 'desc';
    onSort?: (field: string) => void;
};

export function OwnershipTable({ data, loading, sortField, sortDir, onSort }: OwnershipTableProps) {
    return (
        <AdminDataTable
            columns={COLUMNS}
            data={data}
            loading={loading}
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
            emptyTitle="No ownership records"
            emptyDescription="Entity ownership verification records will appear here."
        />
    );
}
