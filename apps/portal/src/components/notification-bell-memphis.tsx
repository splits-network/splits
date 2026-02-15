"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { NotificationItem, ColorBar } from "@splits-network/memphis-ui";
import type { AccentColor } from "@splits-network/memphis-ui";
import {
    formatNotificationTime,
    getNotificationIcon,
    InAppNotification,
} from "@/lib/notifications";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { useNotificationTabIndicator } from "@/hooks/use-notification-tab-indicator";

// ─── Category → Memphis accent color ────────────────────────────────────────
function getCategoryAccent(category?: string): AccentColor {
    switch (category) {
        case "application": return "coral";
        case "placement": return "teal";
        case "proposal": return "yellow";
        case "candidate": return "purple";
        case "collaboration": return "teal";
        case "invitation": return "coral";
        case "system": return "purple";
        default: return "coral";
    }
}

function getCategoryLabel(category?: string): string | undefined {
    switch (category) {
        case "application": return "Application";
        case "placement": return "Placement";
        case "proposal": return "Proposal";
        case "candidate": return "Candidate";
        case "collaboration": return "Team";
        case "invitation": return "Invitation";
        case "system": return "System";
        default: return undefined;
    }
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function NotificationBellMemphis() {
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
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Fetch unread count every 15 seconds
    const loadUnreadCount = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const res = await client.get("/notifications/unread-count");
            const count = res?.data?.count ?? 0;

            if (previousUnreadCount.current !== null && count > previousUnreadCount.current) {
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
            if (!token) { setLoading(false); return; }

            const client = createAuthenticatedClient(token);
            const res = await client.get("/notifications", { params: { limit: 10 } });
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
                await client.patch(`/notifications/${notification.id}`, { read: true });
                setUnreadCount((prev) => Math.max(0, prev - 1));
                previousUnreadCount.current = Math.max(0, (previousUnreadCount.current ?? 1) - 1);
                setNotifications((prev) =>
                    prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
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
            await client.patch(`/notifications/${notification.id}`, { read: newRead });
            setNotifications((prev) =>
                prev.map((n) => (n.id === notification.id ? { ...n, read: newRead } : n)),
            );
            setUnreadCount((prev) => newRead ? Math.max(0, prev - 1) : prev + 1);
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
            setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
            loadUnreadCount();
        } catch (err) {
            console.warn("Failed to dismiss notification:", err);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* ── Bell Button ── */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-10 h-10 flex items-center justify-center border-interactive border-dark-gray text-white/50 transition-all hover:-translate-y-0.5 cursor-pointer"
                aria-label="Notifications"
                title="Notifications"
            >
                <i className="fa-duotone fa-regular fa-bell text-sm" />
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-5 h-5 flex items-center justify-center px-1 text-[10px] font-black bg-coral text-dark border-detail border-dark">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* ── Dropdown Panel ── */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 border-4 border-coral bg-dark z-[100]">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b-4 border-dark-gray">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-5 bg-coral" />
                            <span className="text-xs font-black uppercase tracking-[0.15em] text-white">
                                Notifications
                            </span>
                            {unreadCount > 0 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 border-detail border-coral text-coral">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={handleMarkAllRead}
                                    className="text-[9px] font-bold uppercase tracking-wider text-teal transition-colors hover:text-white cursor-pointer"
                                >
                                    Mark all read
                                </button>
                            )}
                            <Link
                                href="/portal/notifications"
                                onClick={() => setIsOpen(false)}
                                className="text-[9px] font-bold uppercase tracking-wider text-white/40 transition-colors hover:text-white"
                            >
                                View all
                            </Link>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2">
                                <i className="fa-duotone fa-regular fa-spinner-third fa-spin text-xl text-coral" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                                    Loading...
                                </span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-3">
                                <div className="w-14 h-14 flex items-center justify-center border-container border-dark-gray">
                                    <i className="fa-duotone fa-regular fa-inbox text-2xl text-white/20" />
                                </div>
                                <div className="text-center">
                                    <div className="text-xs font-black uppercase tracking-wider text-white/40">
                                        All Clear
                                    </div>
                                    <div className="text-[10px] text-white/20 mt-1">
                                        No notifications yet
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-2 space-y-2">
                                {notifications.map((notification) => {
                                    const accent = getCategoryAccent(notification.category);
                                    return (
                                        <div
                                            key={notification.id}
                                            className="cursor-pointer"
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <NotificationItem
                                                title={notification.subject}
                                                description={notification.action_label || notification.event_type || ""}
                                                time={formatNotificationTime(notification.created_at)}
                                                icon={`fa-duotone fa-regular ${getNotificationIcon(notification.category)}`}
                                                color={accent}
                                                categoryLabel={getCategoryLabel(notification.category)}
                                                read={notification.read}
                                                onToggleRead={() => handleToggleRead(notification)}
                                                onDelete={() => handleDismiss(notification.id)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="border-t-4 border-dark-gray">
                            <Link
                                href="/portal/notifications"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-white/40 transition-colors hover:text-coral"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-right text-[8px]" />
                                View all notifications
                            </Link>
                        </div>
                    )}

                    {/* Memphis accent bar */}
                    <ColorBar height="h-1" />
                </div>
            )}
        </div>
    );
}
