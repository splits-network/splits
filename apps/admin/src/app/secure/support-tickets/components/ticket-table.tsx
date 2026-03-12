'use client';

import { useRouter } from 'next/navigation';
import { AdminDataTable, type Column } from '@/components/shared';

export type TicketRow = {
    id: string;
    subject: string | null;
    body: string;
    category: string;
    status: string;
    source_app: string;
    visitor_name: string | null;
    visitor_email: string | null;
    assigned_admin_id: string | null;
    created_at: string;
};

type Props = {
    data: TicketRow[];
    loading: boolean;
    sortField?: string;
    sortDir?: 'asc' | 'desc';
    onSort: (field: string) => void;
};

const STATUS_BADGE: Record<string, string> = {
    open: 'badge-warning',
    in_progress: 'badge-info',
    resolved: 'badge-success',
    closed: 'badge-ghost',
};

const SOURCE_BADGE: Record<string, string> = {
    portal: 'badge-primary',
    candidate: 'badge-secondary',
    corporate: 'badge-accent',
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function TicketTable({ data, loading, sortField, sortDir, onSort }: Props) {
    const router = useRouter();

    const columns: Column<TicketRow>[] = [
        {
            key: 'subject',
            label: 'Subject',
            render: (item) => (
                <div className="max-w-xs">
                    <div className="font-medium text-sm truncate">
                        {item.subject || item.body.substring(0, 60)}
                    </div>
                    {item.subject && (
                        <div className="text-sm text-base-content/50 truncate">
                            {item.body.substring(0, 80)}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'visitor_name',
            label: 'Visitor',
            render: (item) => (
                <div>
                    <div className="text-sm">{item.visitor_name || 'Anonymous'}</div>
                    {item.visitor_email && (
                        <div className="text-sm text-base-content/50">{item.visitor_email}</div>
                    )}
                </div>
            ),
        },
        {
            key: 'category',
            label: 'Category',
            render: (item) => (
                <span className="badge badge-sm badge-ghost capitalize">{item.category}</span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (item) => (
                <span className={`badge badge-sm ${STATUS_BADGE[item.status] ?? 'badge-ghost'}`}>
                    {item.status.replace('_', ' ')}
                </span>
            ),
        },
        {
            key: 'source_app',
            label: 'Source',
            render: (item) => (
                <span className={`badge badge-sm ${SOURCE_BADGE[item.source_app] ?? 'badge-ghost'}`}>
                    {item.source_app}
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
            onRowClick={(item) => router.push(`/secure/support-tickets/${item.id}`)}
            emptyTitle="No support tickets"
            emptyDescription="No tickets match the current filters."
        />
    );
}
