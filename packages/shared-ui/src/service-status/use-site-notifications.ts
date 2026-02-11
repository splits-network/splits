"use client";

import { useCallback, useEffect, useState } from "react";
import { getGatewayBaseUrl } from "./gateway-url";

export interface SiteNotification {
    id: string;
    type: string;
    severity: string;
    source: string;
    title: string;
    message: string | null;
    starts_at: string | null;
    expires_at: string | null;
    is_active: boolean;
    dismissible: boolean;
    metadata: Record<string, any>;
    created_at: string;
}

export function useSiteNotifications(options?: {
    autoRefresh?: boolean;
    refreshInterval?: number;
}) {
    const { autoRefresh = true, refreshInterval = 60000 } = options || {};

    const [notifications, setNotifications] = useState<SiteNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

    // Load dismissed notification IDs from sessionStorage on mount
    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const stored = sessionStorage.getItem(
                "dismissed-site-notifications",
            );
            if (stored) {
                const parsed = JSON.parse(stored) as {
                    id: string;
                    at: number;
                }[];
                const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
                const stillValid = parsed.filter((d) => d.at > tenMinutesAgo);
                setDismissedIds(new Set(stillValid.map((d) => d.id)));
                if (stillValid.length !== parsed.length) {
                    sessionStorage.setItem(
                        "dismissed-site-notifications",
                        JSON.stringify(stillValid),
                    );
                }
            }
        } catch {
            // Ignore storage errors
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await fetch(`${getGatewayBaseUrl()}/api/v2/site-notifications`, {
                cache: "no-store",
                signal: AbortSignal.timeout(10000),
            });

            const json = await response.json().catch(() => ({}));
            setNotifications(json.data || []);
            setIsLoading(false);
        } catch {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();

        if (autoRefresh) {
            const interval = setInterval(fetchNotifications, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, refreshInterval, fetchNotifications]);

    const dismiss = useCallback((notificationId: string) => {
        setDismissedIds((prev) => {
            const next = new Set(prev);
            next.add(notificationId);

            if (typeof window !== "undefined") {
                try {
                    const stored = sessionStorage.getItem(
                        "dismissed-site-notifications",
                    );
                    const existing: { id: string; at: number }[] = stored
                        ? JSON.parse(stored)
                        : [];
                    existing.push({ id: notificationId, at: Date.now() });
                    sessionStorage.setItem(
                        "dismissed-site-notifications",
                        JSON.stringify(existing),
                    );
                } catch {
                    // Ignore storage errors
                }
            }

            return next;
        });
    }, []);

    // Filter out dismissed notifications
    const activeNotifications = notifications.filter(
        (n) => !dismissedIds.has(n.id) || !n.dismissible,
    );

    const hasNotifications = activeNotifications.length > 0;

    return {
        notifications: activeNotifications,
        allNotifications: notifications,
        isLoading,
        hasNotifications,
        dismiss,
        refresh: fetchNotifications,
    };
}
