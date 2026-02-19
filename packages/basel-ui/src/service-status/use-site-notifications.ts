"use client";

import { useCallback, useEffect, useState } from "react";

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

const STORAGE_KEY = "dismissed-site-notifications";
const DISMISS_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Resolve the API gateway base URL.
 *
 * Local dev: frontends run on different ports (3100, 3101, 3102) than the
 * gateway (3000). NEXT_PUBLIC_API_URL provides the gateway origin.
 *
 * Production: the ingress routes /api/* to the gateway, but using the
 * full URL from the env var is safe everywhere.
 */
function getGatewayBaseUrl(): string {
    if (typeof window === "undefined") return "";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
        return apiUrl.replace(/\/+$/, "").replace(/\/api(?:\/v[0-9]+)?$/, "");
    }
    return "";
}

export function useSiteNotifications(options?: {
    autoRefresh?: boolean;
    refreshInterval?: number;
}) {
    const { autoRefresh = true, refreshInterval = 60000 } = options || {};

    const [notifications, setNotifications] = useState<SiteNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

    // Load dismissed IDs from sessionStorage on mount
    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as { id: string; at: number }[];
                const cutoff = Date.now() - DISMISS_TTL_MS;
                const valid = parsed.filter((d) => d.at > cutoff);
                setDismissedIds(new Set(valid.map((d) => d.id)));
                if (valid.length !== parsed.length) {
                    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
                }
            }
        } catch {
            // Ignore storage errors
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            const base = getGatewayBaseUrl();
            const response = await fetch(`${base}/api/v2/site-notifications`, {
                cache: "no-store",
                signal: AbortSignal.timeout(10000),
            });
            if (!response.ok) {
                setIsLoading(false);
                return;
            }
            const json = await response.json().catch(() => ({}));
            setNotifications(json.data || []);
        } catch {
            // Silently fail — banner just won't show
        } finally {
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
                    const stored = sessionStorage.getItem(STORAGE_KEY);
                    const existing: { id: string; at: number }[] = stored
                        ? JSON.parse(stored)
                        : [];
                    existing.push({ id: notificationId, at: Date.now() });
                    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
                } catch {
                    // Ignore storage errors
                }
            }
            return next;
        });
    }, []);

    const activeNotifications = notifications.filter(
        (n) => !dismissedIds.has(n.id) || !n.dismissible,
    );

    return {
        notifications: activeNotifications,
        allNotifications: notifications,
        isLoading,
        hasNotifications: activeNotifications.length > 0,
        dismiss,
        refresh: fetchNotifications,
    };
}
