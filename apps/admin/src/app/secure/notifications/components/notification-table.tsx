'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { AdminDataTable, AdminConfirmModal, type Column } from '@/components/shared';
import { AdminApiClient } from '@/lib/api-client';
import { useAdminToast } from '@/hooks/use-admin-toast';

export type SiteNotification = {
    id: string;
    type: string;
    severity: string;
    title: string;
    message?: string;
    is_active: boolean;
    dismissible: boolean;
    starts_at?: string;
    expires_at?: string;
    created_at: string;
};

type NotificationTableProps = {
    data: SiteNotification[];
    loading: boolean;
    sortField?: string;
    sortDir?: 'asc' | 'desc';
    onSort: (field: string) => void;
    onEdit: (notification: SiteNotification) => void;
    onRefresh: () => void;
};

const SEVERITY_BADGE: Record<string, string> = {
    info: 'badge-info',
    warning: 'badge-warning',
    critical: 'badge-error',
};

function formatDate(iso?: string) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function NotificationTable({ data, loading, sortField, sortDir, onSort, onEdit, onRefresh }: NotificationTableProps) {
    const { getToken } = useAuth();
    const toast = useAdminToast();
    const [deleteTarget, setDeleteTarget] = useState<SiteNotification | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [toggling, setToggling] = useState<string | null>(null);

    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');
            const client = new AdminApiClient(token);
            await client.delete(`/notification/admin/site-notifications/${deleteTarget.id}`);
            toast.success('Notification deleted');
            onRefresh();
        } catch {
            toast.error('Failed to delete notification');
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    }

    async function handleToggle(notification: SiteNotification) {
        setToggling(notification.id);
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');
            const client = new AdminApiClient(token);
            await client.patch(`/notification/admin/site-notifications/${notification.id}`, {
                is_active: !notification.is_active,
            });
            toast.success(`Notification ${notification.is_active ? 'deactivated' : 'activated'}`);
            onRefresh();
        } catch {
            toast.error('Failed to update notification');
        } finally {
            setToggling(null);
        }
    }

    const columns: Column<SiteNotification>[] = [
        {
            key: 'title',
            label: 'Title',
            sortable: true,
            render: (item) => (
                <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    {item.message && (
                        <p className="text-sm text-base-content/50 truncate max-w-xs">{item.message}</p>
                    )}
                </div>
            ),
        },
        {
            key: 'type',
            label: 'Type',
            render: (item) => (
                <span className="badge badge-ghost badge-sm capitalize">{item.type}</span>
            ),
        },
        {
            key: 'severity',
            label: 'Severity',
            render: (item) => (
                <span className={`badge badge-sm capitalize ${SEVERITY_BADGE[item.severity] ?? 'badge-ghost'}`}>
                    {item.severity}
                </span>
            ),
        },
        {
            key: 'is_active',
            label: 'Active',
            render: (item) => (
                <input
                    type="checkbox"
                    className="toggle toggle-sm toggle-primary"
                    checked={item.is_active}
                    disabled={toggling === item.id}
                    onChange={() => handleToggle(item)}
                />
            ),
        },
        {
            key: 'expires_at',
            label: 'Expires',
            render: (item) => <span className="text-sm text-base-content/60">{formatDate(item.expires_at)}</span>,
        },
        {
            key: 'created_at',
            label: 'Created',
            sortable: true,
            render: (item) => <span className="text-sm text-base-content/60">{formatDate(item.created_at)}</span>,
        },
    ];

    return (
        <>
            <AdminDataTable
                columns={columns}
                data={data}
                loading={loading}
                sortField={sortField}
                sortDir={sortDir}
                onSort={onSort}
                emptyTitle="No notifications"
                emptyDescription="No site notifications have been created."
                actions={(item) => (
                    <div className="flex items-center gap-1 justify-end">
                        <button type="button" className="btn btn-xs btn-ghost" onClick={() => onEdit(item)}>
                            <i className="fa-duotone fa-regular fa-pen-to-square" />
                        </button>
                        <button type="button" className="btn btn-xs btn-ghost text-error" onClick={() => setDeleteTarget(item)}>
                            <i className="fa-duotone fa-regular fa-trash" />
                        </button>
                    </div>
                )}
            />

            <AdminConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete Notification"
                message={`Delete "${deleteTarget?.title}"? This action cannot be undone.`}
                confirmLabel="Delete"
                confirmVariant="error"
                loading={deleting}
            />
        </>
    );
}
