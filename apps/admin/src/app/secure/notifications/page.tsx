'use client';

import { useState } from 'react';
import { useStandardList } from '@/hooks/use-standard-list';
import { AdminPageHeader } from '@/components/shared';
import { NotificationTable, type SiteNotification } from './components/notification-table';
import { NotificationForm } from './components/notification-form';

type Filters = {
    is_active: string;
    severity: string;
};

const SEVERITY_OPTIONS = [
    { label: 'All Severities', value: '' },
    { label: 'Info', value: 'info' },
    { label: 'Warning', value: 'warning' },
    { label: 'Critical', value: 'critical' },
];

export default function NotificationsPage() {
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<SiteNotification | undefined>(undefined);

    const {
        data,
        total,
        totalPages,
        loading,
        filters,
        setFilter,
        sortBy,
        sortOrder,
        handleSort,
        page,
        goToPage,
        refresh,
    } = useStandardList<SiteNotification, Filters>({
        endpoint: '/notification/admin/site-notifications',
        defaultFilters: { is_active: '', severity: '' },
        defaultLimit: 25,
    });

    function openCreate() {
        setEditing(undefined);
        setFormOpen(true);
    }

    function openEdit(notification: SiteNotification) {
        setEditing(notification);
        setFormOpen(true);
    }

    function handleClose() {
        setFormOpen(false);
        setEditing(undefined);
    }

    return (
        <div>
            <AdminPageHeader
                title="Site Notifications"
                subtitle={`${total} notification${total !== 1 ? 's' : ''}`}
                actions={
                    <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
                        <i className="fa-duotone fa-regular fa-plus" />
                        Create
                    </button>
                }
            />

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        className={`btn btn-sm ${filters.is_active === '' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setFilter('is_active', '')}
                    >
                        All
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm ${filters.is_active === 'true' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setFilter('is_active', 'true')}
                    >
                        Active
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm ${filters.is_active === 'false' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setFilter('is_active', 'false')}
                    >
                        Inactive
                    </button>
                </div>
                <select
                    className="select select-sm"
                    value={filters.severity}
                    onChange={(e) => setFilter('severity', e.target.value)}
                >
                    {SEVERITY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="card bg-base-100 shadow-sm">
                <NotificationTable
                    data={data}
                    loading={loading}
                    sortField={sortBy}
                    sortDir={sortOrder}
                    onSort={handleSort}
                    onEdit={openEdit}
                    onRefresh={refresh}
                />

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-base-200">
                        <span className="text-sm text-base-content/60">
                            Page {page} of {totalPages}
                        </span>
                        <div className="join">
                            <button
                                type="button"
                                className="join-item btn btn-sm"
                                disabled={page <= 1}
                                onClick={() => goToPage(page - 1)}
                            >
                                <i className="fa-duotone fa-regular fa-chevron-left" />
                            </button>
                            <button
                                type="button"
                                className="join-item btn btn-sm"
                                disabled={page >= totalPages}
                                onClick={() => goToPage(page + 1)}
                            >
                                <i className="fa-duotone fa-regular fa-chevron-right" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <NotificationForm
                isOpen={formOpen}
                onClose={handleClose}
                onSuccess={refresh}
                initial={editing}
            />
        </div>
    );
}
