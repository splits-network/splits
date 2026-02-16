"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
    formatNotificationTime,
    getNotificationIcon,
    getPriorityColor,
    InAppNotification,
} from "@/lib/notifications";
import { createAuthenticatedClient } from "@/lib/api-client";

// ===== TYPES =====

type FilterMode = "all" | "unread";

// ===== PAGE COMPONENT =====

export default function NotificationsPage() {
    const router = useRouter();
    const { getToken } = useAuth();
    const [notifications, setNotifications] = useState<InAppNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterMode>("all");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    // Load notifications when filter changes
    useEffect(() => {
        loadNotifications();
    }, [filter]);

    const loadNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            if (!token) throw new Error("User not authenticated");

            const client = createAuthenticatedClient(token);
            const data = await client
                .get("/notifications", {
                    params: {
                        filters: {
                            unread_only: filter === "unread" ? true : undefined,
                        },
                        limit: 100,
                    },
                })
                .then((res) => res.data as InAppNotification[]);

            setNotifications(data);
        } catch (err: any) {
            console.error("Failed to fetch notifications:", err);
            setError(err.message || "Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notification: InAppNotification) => {
        // Mark as read if unread
        if (!notification.read) {
            try {
                const token = await getToken();
                if (!token) throw new Error("User not authenticated");

                const client = createAuthenticatedClient(token);
                await client.patch(`/notifications/${notification.id}`, {
                    read: true,
                });
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === notification.id ? { ...n, read: true } : n,
                    ),
                );
            } catch (err) {
                console.error("Failed to mark as read:", err);
            }
        }

        // Navigate if action URL exists
        if (notification.action_url) {
            router.push(notification.action_url);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const token = await getToken();
            if (!token) throw new Error("User not authenticated");

            const client = createAuthenticatedClient(token);
            await client.post("/notifications/mark-all-read", {});
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    const handleDismiss = async (
        notificationId: string,
        event: React.MouseEvent,
    ) => {
        event.stopPropagation();
        try {
            const token = await getToken();
            if (!token) throw new Error("User not authenticated");

            const client = createAuthenticatedClient(token);
            await client.delete(`/notifications/${notificationId}`);
            setNotifications((prev) =>
                prev.filter((n) => n.id !== notificationId),
            );
        } catch (err) {
            console.error("Failed to dismiss notification:", err);
        }
    };

    // Computed values
    const unreadCount = notifications.filter((n) => !n.read).length;
    const categories = [
        "all",
        ...Array.from(
            new Set(
                notifications
                    .map((n) => n.category)
                    .filter((c): c is string => Boolean(c)),
            ),
        ),
    ];
    const filteredNotifications =
        selectedCategory === "all"
            ? notifications
            : notifications.filter((n) => n.category === selectedCategory);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Notifications</h1>
                    {unreadCount > 0 && (
                        <p className="text-base-content/60 mt-1">
                            {unreadCount} unread notification
                            {unreadCount !== 1 ? "s" : ""}
                        </p>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleMarkAllRead}
                    >
                        <i className="fa-duotone fa-regular fa-check-double"></i>
                        Mark all read
                    </button>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="alert alert-error mb-6">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            {/* Filters */}
            <div className="card bg-base-100 shadow mb-4">
                <div className="card-body p-4">
                    <div className="flex flex-wrap gap-4 items-center">
                        {/* Read/Unread Filter */}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-ghost"}`}
                                onClick={() => setFilter("all")}
                            >
                                All
                            </button>
                            <button
                                type="button"
                                className={`btn btn-sm ${filter === "unread" ? "btn-primary" : "btn-ghost"}`}
                                onClick={() => setFilter("unread")}
                            >
                                Unread
                                {unreadCount > 0 && (
                                    <span className="badge badge-sm ml-1">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Category Filter */}
                        {categories.length > 1 && (
                            <div className="flex gap-2 items-center">
                                <span className="text-sm text-base-content/60">
                                    Category:
                                </span>
                                <select
                                    className="select select-sm"
                                    value={selectedCategory}
                                    onChange={(e) =>
                                        setSelectedCategory(e.target.value)
                                    }
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat === "all"
                                                ? "All Categories"
                                                : cat.charAt(0).toUpperCase() +
                                                  cat.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Notification List */}
            <div className="card bg-base-100 shadow">
                <div className="card-body p-0">
                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center items-center py-12">
                            <span className="loading loading-spinner loading-lg"></span>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && filteredNotifications.length === 0 && (
                        <div className="text-center py-12">
                            <i className="fa-duotone fa-regular fa-inbox text-6xl text-base-content/20 mb-4"></i>
                            <p className="text-lg text-base-content/60">
                                {filter === "unread"
                                    ? "No unread notifications"
                                    : "No notifications"}
                            </p>
                            {filter === "unread" && (
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-sm mt-4"
                                    onClick={() => setFilter("all")}
                                >
                                    View all notifications
                                </button>
                            )}
                        </div>
                    )}

                    {/* Notification Items */}
                    {!loading && filteredNotifications.length > 0 && (
                        <div className="divide-y divide-base-300">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`
                                        flex gap-4 p-4 cursor-pointer hover:bg-base-200 transition-colors
                                        ${!notification.read ? "bg-primary/5 border-l-4 border-l-primary" : ""}
                                    `}
                                    onClick={() =>
                                        handleNotificationClick(notification)
                                    }
                                >
                                    {/* Icon */}
                                    <div className="flex-shrink-0">
                                        <div
                                            className={`
                                            w-12 h-12 rounded-full flex items-center justify-center
                                            ${!notification.read ? "bg-primary text-primary-content" : "bg-base-300"}
                                        `}
                                        >
                                            <i
                                                className={`fa-duotone fa-regular ${getNotificationIcon(notification.category)} text-lg`}
                                            ></i>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div className="flex-1">
                                                <p
                                                    className={`text-base ${!notification.read ? "font-semibold" : ""}`}
                                                >
                                                    {notification.subject}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-sm text-base-content/60">
                                                        {formatNotificationTime(
                                                            notification.created_at,
                                                        )}
                                                    </span>
                                                    {notification.category && (
                                                        <span className="badge badge-sm badge-ghost">
                                                            {
                                                                notification.category
                                                            }
                                                        </span>
                                                    )}
                                                    {notification.priority !==
                                                        "normal" && (
                                                        <span
                                                            className={`badge badge-sm ${getPriorityColor(notification.priority)}`}
                                                        >
                                                            {
                                                                notification.priority
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!notification.read && (
                                                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                                                )}
                                                <button
                                                    type="button"
                                                    className="btn btn-ghost btn-xs btn-square"
                                                    onClick={(e) =>
                                                        handleDismiss(
                                                            notification.id,
                                                            e,
                                                        )
                                                    }
                                                    aria-label="Dismiss"
                                                >
                                                    <i className="fa-duotone fa-regular fa-times"></i>
                                                </button>
                                            </div>
                                        </div>
                                        {notification.action_label &&
                                            notification.action_url && (
                                                <div className="mt-2">
                                                    <span className="text-sm text-primary inline-flex items-center gap-1">
                                                        {
                                                            notification.action_label
                                                        }
                                                        <i className="fa-duotone fa-regular fa-arrow-right text-xs"></i>
                                                    </span>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
