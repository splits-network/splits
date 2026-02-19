"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
    formatNotificationTime,
    getNotificationIcon,
    InAppNotification,
} from "@/lib/notifications";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { useNotificationTabIndicator } from "@/hooks/use-notification-tab-indicator";

/* ─── Category to DaisyUI semantic color mapping ─────────────────────────── */

function getCategoryColor(category?: string): string {
    switch (category) {
        case "application":
            return "text-primary";
        case "placement":
            return "text-secondary";
        case "proposal":
            return "text-warning";
        case "candidate":
            return "text-accent";
        case "collaboration":
            return "text-secondary";
        case "invitation":
            return "text-primary";
        case "system":
            return "text-info";
        default:
            return "text-primary";
    }
}

function getCategoryLabel(category?: string): string | undefined {
    switch (category) {
        case "application":
            return "Application";
        case "placement":
            return "Placement";
        case "proposal":
            return "Proposal";
        case "candidate":
            return "Candidate";
        case "collaboration":
            return "Team";
        case "invitation":
            return "Invitation";
        case "system":
            return "System";
        default:
            return undefined;
    }
}

/* ─── Notification Item (Basel) ──────────────────────────────────────────── */

function NotificationItemBasel({
    notification,
    onClick,
    onToggleRead,
    onDelete,
}: {
    notification: InAppNotification;
    onClick: () => void;
    onToggleRead: () => void;
    onDelete: () => void;
}) {
    const colorClass = getCategoryColor(notification.category);
    const categoryLabel = getCategoryLabel(notification.category);
    const icon = getNotificationIcon(notification.category);

    return (
        <div
            className={`relative border-l-4 ${notification.read ? "border-base-300 bg-base-100" : "border-primary bg-base-200"} p-3 hover:bg-base-200/80 transition-colors cursor-pointer`}
            onClick={onClick}
        >
            <div className="flex items-center gap-3">
                <div
                    className="w-8 h-8 bg-base-200 flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ borderRadius: 0 }}
                >
                    <i
                        className={`fa-duotone fa-regular ${icon} text-sm ${colorClass}`}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        {categoryLabel && (
                            <span
                                className={`text-sm font-semibold uppercase tracking-wider ${colorClass}`}
                            >
                                {categoryLabel}
                            </span>
                        )}
                        <span className="text-sm text-base-content/30">
                            {formatNotificationTime(notification.created_at)}
                        </span>
                    </div>
                    <p className="text-sm font-semibold text-base-content truncate">
                        {notification.subject}
                    </p>
                    {notification.action_label && (
                        <p className="text-sm text-base-content/50 truncate mt-0.5">
                            {notification.action_label}
                        </p>
                    )}
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleRead();
                        }}
                        className="btn btn-ghost btn-sm btn-square"
                        style={{ borderRadius: 0 }}
                        title={
                            notification.read
                                ? "Mark as unread"
                                : "Mark as read"
                        }
                    >
                        <i
                            className={`fa-duotone fa-regular ${notification.read ? "fa-envelope" : "fa-envelope-open"} text-base-content/40`}
                        />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="btn btn-ghost btn-sm btn-square"
                        style={{ borderRadius: 0 }}
                        title="Dismiss"
                    >
                        <i className="fa-duotone fa-regular fa-xmark text-base-content/40" />
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Notification Bell Component (Basel) ────────────────────────────────── */

export default function NotificationBell() {
    const router = useRouter();
    const { getToken } = useAuth();
    const toast = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<InAppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const previousUnreadCount = useRef<number | null>(null);

    // Browser tab indicator
    useNotificationTabIndicator(unreadCount);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Fetch unread count every 15 seconds
    const loadUnreadCount = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const res = await client.get("/notifications/unread-count");
            const count = res?.data?.count ?? 0;

            if (
                previousUnreadCount.current !== null &&
                count > previousUnreadCount.current
            ) {
                const newCount = count - previousUnreadCount.current;
                toast.info(
                    newCount === 1
                        ? "You have a new notification"
                        : `You have ${newCount} new notifications`,
                );
            }
            previousUnreadCount.current = count;
            setUnreadCount(count);
        } catch (err) {
            console.warn("Failed to fetch unread count:", err);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toast]);

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
            const res = await client.get("/notifications", {
                params: { limit: 10 },
            });
            const data = res?.data ?? [];
            setNotifications(Array.isArray(data) ? data : []);
        } catch (err) {
            console.warn("Failed to fetch notifications:", err);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Initial load and polling
    useEffect(() => {
        loadUnreadCount();
        const interval = setInterval(loadUnreadCount, 15000);
        return () => clearInterval(interval);
    }, [loadUnreadCount]);

    // Load notifications when dropdown opens
    useEffect(() => {
        if (isOpen) loadNotifications();
    }, [isOpen, loadNotifications]);

    const handleNotificationClick = async (notification: InAppNotification) => {
        if (!notification.read) {
            try {
                const token = await getToken();
                if (!token) return;
                const client = createAuthenticatedClient(token);
                await client.patch(`/notifications/${notification.id}`, {
                    read: true,
                });
                setUnreadCount((prev) => Math.max(0, prev - 1));
                previousUnreadCount.current = Math.max(
                    0,
                    (previousUnreadCount.current ?? 1) - 1,
                );
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === notification.id ? { ...n, read: true } : n,
                    ),
                );
            } catch (error) {
                console.error("Failed to mark as read:", error);
            }
        }
        if (notification.action_url) {
            setIsOpen(false);
            router.push(notification.action_url);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.post("/notifications/mark-all-read", {});
            setUnreadCount(0);
            previousUnreadCount.current = 0;
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const handleToggleRead = async (notification: InAppNotification) => {
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const newRead = !notification.read;
            await client.patch(`/notifications/${notification.id}`, {
                read: newRead,
            });
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notification.id ? { ...n, read: newRead } : n,
                ),
            );
            setUnreadCount((prev) =>
                newRead ? Math.max(0, prev - 1) : prev + 1,
            );
            previousUnreadCount.current = newRead
                ? Math.max(0, (previousUnreadCount.current ?? 1) - 1)
                : (previousUnreadCount.current ?? 0) + 1;
        } catch (err) {
            console.warn("Failed to toggle read:", err);
        }
    };

    const handleDismiss = async (notificationId: string) => {
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.delete(`/notifications/${notificationId}`);
            setNotifications((prev) =>
                prev.filter((n) => n.id !== notificationId),
            );
            loadUnreadCount();
        } catch (err) {
            console.warn("Failed to dismiss notification:", err);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-ghost btn-square relative"
                style={{ borderRadius: 0 }}
                aria-label="Notifications"
                title="Notifications"
            >
                <i className="fa-duotone fa-regular fa-bell text-base-content/60" />
                {unreadCount > 0 && (
                    <span
                        className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[9px] font-bold bg-accent text-accent-content"
                        style={{ borderRadius: 0 }}
                    >
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div
                    className="fixed inset-x-2 top-[var(--header-h,3.5rem)] sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-96 bg-base-100 border border-base-300 shadow-lg z-[100]"
                    style={{ borderRadius: 0 }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-base-300">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-5 bg-primary" />
                            <span className="text-sm font-semibold uppercase tracking-[0.15em] text-base-content">
                                Notifications
                            </span>
                            {unreadCount > 0 && (
                                <span
                                    className="text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary"
                                    style={{ borderRadius: 0 }}
                                >
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={handleMarkAllRead}
                                    className="text-[10px] font-semibold uppercase tracking-wider text-secondary hover:text-base-content transition-colors cursor-pointer"
                                >
                                    Mark all read
                                </button>
                            )}
                            <Link
                                href="/portal/notifications"
                                onClick={() => setIsOpen(false)}
                                className="text-sm font-semibold uppercase tracking-wider text-base-content/40 hover:text-base-content transition-colors"
                            >
                                View all
                            </Link>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2">
                                <i className="fa-duotone fa-regular fa-spinner-third fa-spin text-xl text-primary" />
                                <span className="text-md font-semibold uppercase tracking-wider text-base-content/30">
                                    Loading...
                                </span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-3">
                                <div
                                    className="w-14 h-14 flex items-center justify-center bg-base-200"
                                    style={{ borderRadius: 0 }}
                                >
                                    <i className="fa-duotone fa-regular fa-inbox text-2xl text-base-content/20" />
                                </div>
                                <div className="text-center">
                                    <div className="text-sm font-semibold uppercase tracking-wider text-base-content/40">
                                        All Clear
                                    </div>
                                    <div className="text-xs text-base-content/20 mt-1">
                                        No notifications yet
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-2 space-y-1">
                                {notifications.map((notification) => (
                                    <NotificationItemBasel
                                        key={notification.id}
                                        notification={notification}
                                        onClick={() =>
                                            handleNotificationClick(
                                                notification,
                                            )
                                        }
                                        onToggleRead={() =>
                                            handleToggleRead(notification)
                                        }
                                        onDelete={() =>
                                            handleDismiss(notification.id)
                                        }
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="border-t border-base-300">
                            <Link
                                href="/portal/notifications"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center gap-2 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-base-content/40 hover:text-primary transition-colors"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-right text-sm" />
                                View all notifications
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
