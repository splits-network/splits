"use client";

/**
 * Call Notifications Hook
 * Polls for high-priority call notifications and manages toast display.
 * Uses the same polling pattern as the notification bell (15s interval)
 * but filters for call-specific events with toast payloads.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { InAppNotification } from "@/lib/notifications";

const POLL_INTERVAL_MS = 10_000;

/** Call toast types that warrant immediate display */
const TOAST_EVENT_TYPES = new Set([
    "call.instant",
    "call.starting_soon",
    "call.participant.joined",
    "call.declined",
]);

export function useCallNotifications() {
    const { getToken } = useAuth();
    const [activeToasts, setActiveToasts] = useState<InAppNotification[]>([]);
    const seenIds = useRef<Set<string>>(new Set());
    const initialLoadDone = useRef(false);

    const fetchCallNotifications = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const res = await client.get("/notifications", {
                params: {
                    limit: 10,
                    category: "calls",
                    unread_only: "true",
                },
            });

            const notifications: InAppNotification[] = Array.isArray(res?.data)
                ? res.data
                : [];

            // Filter for toast-worthy call notifications
            const toastNotifications = notifications.filter(
                (n) =>
                    TOAST_EVENT_TYPES.has(n.event_type) &&
                    n.payload?.toastType &&
                    !n.read &&
                    !seenIds.current.has(n.id),
            );

            if (toastNotifications.length > 0 && initialLoadDone.current) {
                // Only show toasts for truly new notifications (not initial load)
                for (const n of toastNotifications) {
                    seenIds.current.add(n.id);
                }
                setActiveToasts((prev) => [...prev, ...toastNotifications]);
            } else if (!initialLoadDone.current) {
                // Mark existing notifications as seen on first load
                for (const n of toastNotifications) {
                    seenIds.current.add(n.id);
                }
                initialLoadDone.current = true;
            }
        } catch (err) {
            console.warn("Failed to fetch call notifications:", err);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchCallNotifications();
        const interval = setInterval(fetchCallNotifications, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchCallNotifications]);

    const dismissToast = useCallback(
        async (notificationId: string) => {
            setActiveToasts((prev) =>
                prev.filter((n) => n.id !== notificationId),
            );

            // Mark as read in the backend
            try {
                const token = await getToken();
                if (!token) return;
                const client = createAuthenticatedClient(token);
                await client.patch(`/notifications/${notificationId}`, {
                    read: true,
                });
            } catch (err) {
                console.warn(
                    "Failed to mark call notification as read:",
                    err,
                );
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const handleAction = useCallback(
        async (notificationId: string, action: string) => {
            if (action === "decline") {
                const notification = activeToasts.find(
                    (n) => n.id === notificationId,
                );
                const callId = notification?.payload?.callId;

                if (callId) {
                    try {
                        const token = await getToken();
                        if (!token) return;
                        const client = createAuthenticatedClient(token);
                        await client.post(`/calls/${callId}/decline`, {});
                    } catch (err) {
                        console.warn("Failed to decline call:", err);
                    }
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [activeToasts],
    );

    return {
        activeToasts,
        dismissToast,
        handleAction,
    };
}
