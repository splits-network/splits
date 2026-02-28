'use client';

import { AdminDataTable, type Column } from '@/components/shared';

export type ChatMessage = {
    id: string;
    sender_name: string;
    recipient_name: string;
    content_preview: string;
    flag_reason: string;
    severity: 'high' | 'medium' | 'low';
    status: 'pending' | 'reviewed' | 'removed' | 'cleared';
    flagged_at: string;
};

const SEVERITY_BADGE: Record<string, string> = {
    high: 'badge-error',
    medium: 'badge-warning',
    low: 'badge-info',
};

const STATUS_BADGE: Record<string, string> = {
    pending: 'badge-warning',
    reviewed: 'badge-info',
    removed: 'badge-error',
    cleared: 'badge-success',
};

const COLUMNS: Column<ChatMessage>[] = [
    {
        key: 'severity',
        label: 'Severity',
        width: '90px',
        render: (item) => (
            <span className={`badge badge-sm ${SEVERITY_BADGE[item.severity]}`}>
                {item.severity}
            </span>
        ),
    },
    {
        key: 'sender_name',
        label: 'From',
        sortable: true,
        render: (item) => (
            <div>
                <p className="font-semibold text-sm">{item.sender_name}</p>
                <p className="text-sm text-base-content/50">to {item.recipient_name}</p>
            </div>
        ),
    },
    {
        key: 'content_preview',
        label: 'Message Preview',
        render: (item) => (
            <p className="text-sm text-base-content/70 line-clamp-2 max-w-xs">
                {item.content_preview}
            </p>
        ),
    },
    {
        key: 'flag_reason',
        label: 'Flag Reason',
        render: (item) => (
            <span className="badge badge-outline badge-sm">{item.flag_reason}</span>
        ),
    },
    {
        key: 'status',
        label: 'Status',
        render: (item) => (
            <span className={`badge badge-sm ${STATUS_BADGE[item.status]}`}>
                {item.status}
            </span>
        ),
    },
    {
        key: 'flagged_at',
        label: 'Flagged',
        sortable: true,
        render: (item) => (
            <span className="text-sm text-base-content/60">
                {new Date(item.flagged_at).toLocaleDateString()}
            </span>
        ),
    },
];

type ChatTableProps = {
    data: ChatMessage[];
    loading?: boolean;
    sortField?: string;
    sortDir?: 'asc' | 'desc';
    onSort?: (field: string) => void;
};

export function ChatTable({ data, loading, sortField, sortDir, onSort }: ChatTableProps) {
    return (
        <AdminDataTable
            columns={COLUMNS}
            data={data}
            loading={loading}
            sortField={sortField}
            sortDir={sortDir}
            onSort={onSort}
            emptyTitle="No flagged messages"
            emptyDescription="Flagged chat messages will appear here for review."
        />
    );
}
