'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import {
    formatNotificationTime,
    getNotificationIcon,
    InAppNotification,
} from '@/lib/notifications';
import { createAuthenticatedClient } from '@/lib/api-client';

export default function NotificationBell() {
    const router = useRouter();
    const { getToken } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<InAppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Fetch unread count every 30 seconds
    const loadUnreadCount = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response = await client.get<{ data: { count: number } }>('/notifications/unread-count');
            setUnreadCount(response.data.count);
        } catch (error) {
            // Fail silently - notification bell should continue working
        }
    }, [getToken]);

    // Fetch recent notifications when dropdown opens
    const loadNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) {
                setLoading(false);
                return;
            }

            const client = createAuthenticatedClient(token);
            const response = await client.get<{ data: InAppNotification[] }>('/notifications', {
                params: { limit: 10 }
            });
            setNotifications(response.data);
        } catch (error) {
            // Fail silently - show empty state if notifications can't load
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    // Initial load and polling
    useEffect(() => {
        loadUnreadCount();
        const interval = setInterval(loadUnreadCount, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, [loadUnreadCount]);

    // Load notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        }
    }, [isOpen, loadNotifications]);

    const handleNotificationClick = async (notification: InAppNotification) => {
        // Mark as read if unread
        if (!notification.read) {
            try {
                const token = await getToken();
                if (token) {
                    const client = createAuthenticatedClient(token);
                    await client.patch(`/notifications/${notification.id}`, { read: true });
                    setUnreadCount((prev) => Math.max(0, prev - 1));
                    setNotifications((prev) =>
                        prev.map((n) =>
                            n.id === notification.id ? { ...n, read: true } : n
                        )
                    );
                }
            } catch (error) {
                // Fail silently - user can still navigate to the notification
            }
        }

        // Navigate to action URL if present
        if (notification.action_url) {
            setIsOpen(false);
            router.push(notification.action_url);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const token = await getToken();
            if (token) {
                const client = createAuthenticatedClient(token);
                await client.post('/notifications/mark-all-read', {});
                setUnreadCount(0);
                setNotifications((prev) =>
                    prev.map((n) => ({ ...n, read: true }))
                );
            }
        } catch (error) {
            // Fail silently - UI will update optimistically
        }
    };

    const handleDismiss = async (notificationId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        try {
            const token = await getToken();
            if (token) {
                const client = createAuthenticatedClient(token);
                await client.delete(`/notifications/${notificationId}`);
                setNotifications((prev) =>
                    prev.filter((n) => n.id !== notificationId)
                );
                // Refresh unread count
                loadUnreadCount();
            }
        } catch (error) {
            // Fail silently - notification will appear dismissed in UI
        }
    };

    return (
        <div className="dropdown dropdown-end">
            <button
                type="button"
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle relative"
                onFocus={() => setIsOpen(true)}
                onBlur={() => setIsOpen(false)}
                aria-label="Notifications"
                title='Notifications'
            >
                <i className="fa-duotone fa-regular fa-bell text-xl"></i>
                {unreadCount > 0 && (
                    <span className="badge badge-error badge-sm absolute top-1 right-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            <div
                tabIndex={-1}
                className="dropdown-content z-50 mt-3 w-96 shadow bg-base-100 rounded-box border border-base-300"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-base-300">
                    <h3 className="font-semibold text-lg">Notifications</h3>
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                className="btn btn-ghost btn-xs"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={handleMarkAllRead}
                            >
                                Mark all read
                            </button>
                        )}
                        <Link
                            href="/portal/notifications"
                            className="btn btn-ghost btn-xs"
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            View all
                        </Link>
                    </div>
                </div>

                {/* Notification List */}
                <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <span className="loading loading-spinner loading-md"></span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-8 text-base-content/60">
                            <i className="fa-duotone fa-regular fa-inbox text-4xl mb-2"></i>
                            <p>No notifications</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`
                                        flex gap-3 p-4 border-b border-base-300 cursor-pointer
                                        hover:bg-base-200 transition-colors
                                        ${!notification.read ? 'bg-primary/5' : ''}
                                    `}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                {/* Icon */}
                                <div className="shrink-0">
                                    <div className={`
                                            w-10 h-10 rounded-full flex items-center justify-center
                                            ${!notification.read ? 'bg-primary text-primary-content' : 'bg-base-300'}
                                        `}>
                                        <i className={`fa-duotone fa-regular ${getNotificationIcon(notification.category)}`}></i>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={`text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                                            {notification.subject}
                                        </p>
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-xs btn-circle"
                                            onClick={(e) => handleDismiss(notification.id, e)}
                                            aria-label="Dismiss"
                                        >
                                            <i className="fa-duotone fa-regular fa-times"></i>
                                        </button>
                                    </div>
                                    <p className="text-xs text-base-content/60 mt-1">
                                        {formatNotificationTime(notification.created_at)}
                                    </p>
                                    {notification.action_label && (
                                        <span className="text-xs text-primary mt-1 inline-block">
                                            {notification.action_label} →
                                        </span>
                                    )}
                                </div>

                                {/* Unread indicator */}
                                {!notification.read && (
                                    <div className="shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="p-2 border-t border-base-300 text-center">
                        <Link
                            href="/portal/notifications"
                            className="btn btn-ghost btn-sm btn-block"
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            View all notifications
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
