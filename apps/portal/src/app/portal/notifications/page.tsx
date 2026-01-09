'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useStandardList, PaginationControls, SearchInput, EmptyState, LoadingState, ErrorState } from '@/hooks/use-standard-list';
import { createAuthenticatedClient } from '@/lib/api-client';
import {
    InAppNotification,
    formatNotificationTime,
    getNotificationIcon,
    getPriorityColor,
} from '@/lib/notifications';

// Notification filters interface
interface NotificationFilters {
    category?: string;
    unread_only?: boolean;
    priority?: string;
}

// Notification card component
function NotificationCard({
    notification,
    onClick,
    onDismiss
}: {
    notification: InAppNotification;
    onClick: (notification: InAppNotification) => void;
    onDismiss: (id: string) => void;
}) {
    return (
        <div
            className={`
                card bg-base-100 shadow-sm cursor-pointer hover:shadow-md transition-all
                ${!notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''}
            `}
            onClick={() => onClick(notification)}
        >
            <div className="card-body p-4">
                <div className="flex gap-4">
                    {/* Icon */}
                    <div className="shrink-0">
                        <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center
                            ${!notification.read ? 'bg-primary text-primary-content' : 'bg-base-300'}
                        `}>
                            <i className={`fa-duotone fa-regular ${getNotificationIcon(notification.category)} text-lg`}></i>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <p className={`text-base ${!notification.read ? 'font-semibold' : ''}`}>
                                    {notification.subject}
                                </p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <span className="text-sm text-base-content/60">
                                        {formatNotificationTime(notification.created_at)}
                                    </span>
                                    {notification.category && (
                                        <span className="badge badge-sm badge-ghost">
                                            {notification.category}
                                        </span>
                                    )}
                                    {notification.priority !== 'normal' && (
                                        <span className={`badge badge-sm ${getPriorityColor(notification.priority)}`}>
                                            {notification.priority}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!notification.read && (
                                    <div className="w-2 h-2 rounded-full bg-primary shrink-0"></div>
                                )}
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-xs btn-circle"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDismiss(notification.id);
                                    }}
                                    aria-label="Dismiss"
                                >
                                    <i className="fa-duotone fa-regular fa-times"></i>
                                </button>
                            </div>
                        </div>
                        {notification.action_label && notification.action_url && (
                            <div className="mt-3">
                                <span className="text-sm text-primary inline-flex items-center gap-1">
                                    {notification.action_label}
                                    <i className="fa-duotone fa-regular fa-arrow-right text-xs"></i>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Notification table row component
function NotificationRow({
    notification,
    onClick,
    onDismiss
}: {
    notification: InAppNotification;
    onClick: (notification: InAppNotification) => void;
    onDismiss: (id: string) => void;
}) {
    return (
        <tr
            className={`cursor-pointer hover:bg-base-200 ${!notification.read ? 'bg-primary/5' : ''}`}
            onClick={() => onClick(notification)}
        >
            <td>
                <div className="flex items-center gap-3">
                    <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center shrink-0
                        ${!notification.read ? 'bg-primary text-primary-content' : 'bg-base-300'}
                    `}>
                        <i className={`fa-duotone fa-regular ${getNotificationIcon(notification.category)}`}></i>
                    </div>
                    <div className="min-w-0">
                        <p className={`truncate ${!notification.read ? 'font-semibold' : ''}`}>
                            {notification.subject}
                        </p>
                        {notification.action_label && (
                            <span className="text-xs text-primary">
                                {notification.action_label}
                            </span>
                        )}
                    </div>
                </div>
            </td>
            <td>
                {notification.category && (
                    <span className="badge badge-sm badge-ghost">
                        {notification.category}
                    </span>
                )}
            </td>
            <td>
                {notification.priority !== 'normal' && (
                    <span className={`badge badge-sm ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                    </span>
                )}
            </td>
            <td>
                <span className="text-sm text-base-content/60">
                    {formatNotificationTime(notification.created_at)}
                </span>
            </td>
            <td>
                <div className="flex items-center gap-2 justify-end">
                    {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                    )}
                    <button
                        type="button"
                        className="btn btn-ghost btn-xs btn-circle"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDismiss(notification.id);
                        }}
                        aria-label="Dismiss"
                    >
                        <i className="fa-duotone fa-regular fa-times"></i>
                    </button>
                </div>
            </td>
        </tr>
    );
}

// Categories for filter dropdown
const NOTIFICATION_CATEGORIES = [
    { value: '', label: 'All Categories' },
    { value: 'application', label: 'Applications' },
    { value: 'placement', label: 'Placements' },
    { value: 'proposal', label: 'Proposals' },
    { value: 'candidate', label: 'Candidates' },
    { value: 'collaboration', label: 'Collaboration' },
    { value: 'invitation', label: 'Invitations' },
    { value: 'system', label: 'System' },
];

export default function NotificationsPage() {
    const { getToken } = useAuth();
    const router = useRouter();
    const [markingAllRead, setMarkingAllRead] = useState(false);

    // Fetch function for notifications
    const fetchNotifications = useCallback(async (params: Record<string, any>) => {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        const client = createAuthenticatedClient(token);
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.set('page', params.page.toString());
        if (params.limit) queryParams.set('limit', params.limit.toString());
        if (params.search) queryParams.set('search', params.search);
        if (params.category) queryParams.set('category', params.category);
        if (params.unread_only) queryParams.set('unread_only', 'true');
        if (params.priority) queryParams.set('priority', params.priority);

        const response = await client.get(`/notifications?${queryParams.toString()}`);
        return response as { data: InAppNotification[]; pagination: { total: number; page: number; limit: number; total_pages: number } };
    }, [getToken]);

    const {
        data: notifications,
        pagination,
        loading,
        error,
        filters,
        setFilters,
        searchTerm,
        setSearchTerm,
        viewMode,
        setViewMode,
        refetch
    } = useStandardList<InAppNotification, NotificationFilters>({
        fetchFn: fetchNotifications,
        defaultLimit: 25,
        syncToUrl: true
    });

    // Handle notification click
    const handleNotificationClick = async (notification: InAppNotification) => {
        const token = await getToken();
        if (!token) return;

        // Mark as read if unread
        if (!notification.read) {
            try {
                const client = createAuthenticatedClient(token);
                await client.patch(`/notifications/${notification.id}`, { read: true });
                refetch();
            } catch (err) {
                console.error('Failed to mark notification as read:', err);
            }
        }

        // Navigate to action URL if present
        if (notification.action_url) {
            router.push(notification.action_url);
        }
    };

    // Handle dismiss notification
    const handleDismiss = async (notificationId: string) => {
        const token = await getToken();
        if (!token) return;

        try {
            const client = createAuthenticatedClient(token);
            await client.delete(`/notifications/${notificationId}`);
            refetch();
        } catch (err) {
            console.error('Failed to dismiss notification:', err);
        }
    };

    // Handle mark all as read
    const handleMarkAllRead = async () => {
        const token = await getToken();
        if (!token) return;

        setMarkingAllRead(true);
        try {
            const client = createAuthenticatedClient(token);
            await client.post('/notifications/mark-all-read', {});
            refetch();
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        } finally {
            setMarkingAllRead(false);
        }
    };

    // Count unread notifications in current view
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">Notifications</h1>
                        {unreadCount > 0 && (
                            <span className="badge badge-primary">{unreadCount} unread</span>
                        )}
                    </div>
                    <p className="text-base-content/60 mt-1">
                        Stay updated on applications, placements, and more
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={handleMarkAllRead}
                            disabled={markingAllRead}
                        >
                            {markingAllRead ? (
                                <>
                                    <span className="loading loading-spinner loading-xs"></span>
                                    Marking...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-check-double"></i>
                                    Mark All Read
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-base-100 rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <SearchInput
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Search notifications..."
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="fieldset">
                        <select
                            className="select select-sm"
                            value={filters.category || ''}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
                        >
                            {NOTIFICATION_CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Unread Only Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-sm checkbox-primary"
                            checked={filters.unread_only || false}
                            onChange={(e) => setFilters({ ...filters, unread_only: e.target.checked || undefined })}
                        />
                        <span className="text-sm">Unread only</span>
                    </label>

                    {/* View Mode Toggle */}
                    <div className="flex gap-1 bg-base-200 rounded-lg p-1">
                        <button
                            className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <i className="fa-duotone fa-regular fa-grid-2"></i>
                        </button>
                        <button
                            className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setViewMode('table')}
                        >
                            <i className="fa-duotone fa-regular fa-list"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && <LoadingState />}

            {/* Error State */}
            {error && <ErrorState message={error} onRetry={refetch} />}

            {/* Empty State */}
            {!loading && !error && notifications.length === 0 && (
                <EmptyState
                    icon="fa-bell"
                    title="No notifications"
                    description={
                        filters.unread_only
                            ? "You're all caught up! No unread notifications."
                            : filters.category
                                ? `No notifications in this category.`
                                : searchTerm
                                    ? "No notifications match your search."
                                    : "You don't have any notifications yet."
                    }
                />
            )}

            {/* Notifications List */}
            {!loading && !error && notifications.length > 0 && (
                <>
                    {viewMode === 'grid' ? (
                        <div className="space-y-3">
                            {notifications.map((notification) => (
                                <NotificationCard
                                    key={notification.id}
                                    notification={notification}
                                    onClick={handleNotificationClick}
                                    onDismiss={handleDismiss}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-base-100 rounded-lg shadow-sm overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Notification</th>
                                        <th>Category</th>
                                        <th>Priority</th>
                                        <th>Time</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notifications.map((notification) => (
                                        <NotificationRow
                                            key={notification.id}
                                            notification={notification}
                                            onClick={handleNotificationClick}
                                            onDismiss={handleDismiss}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && (
                        <PaginationControls
                            pagination={pagination}
                            onPageChange={(page) => setFilters({ ...filters })}
                        />
                    )}
                </>
            )}
        </div>
    );
}
