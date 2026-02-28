'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAdminRealtime } from './use-admin-realtime';
import { useAuth } from '@clerk/nextjs';

export type AdminCounts = {
    pendingRecruiters: number;
    activeFraud: number;
    pendingPayouts: number;
    activeEscrow: number;
    activeNotifications: number;
    totalUsers: number;
    totalJobs: number;
    totalApplications: number;
};

const DEFAULT_COUNTS: AdminCounts = {
    pendingRecruiters: 0,
    activeFraud: 0,
    pendingPayouts: 0,
    activeEscrow: 0,
    activeNotifications: 0,
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
};

const GATEWAY_URL = process.env.NEXT_PUBLIC_ADMIN_GATEWAY_URL || 'http://localhost:3030';
const POLL_INTERVAL_MS = 60_000;

/**
 * Provides live entity counts for admin sidebar badges.
 *
 * - Initial load via REST (GET /admin/identity/admin-counts)
 * - Real-time updates via WebSocket 'counts' channel
 * - Falls back to polling every 60s when WebSocket is disconnected
 */
export function useRealtimeCounts(): { counts: AdminCounts; loading: boolean } {
    const { getToken } = useAuth();
    const [counts, setCounts] = useState<AdminCounts>(DEFAULT_COUNTS);
    const [loading, setLoading] = useState(true);
    const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchCounts = useCallback(async () => {
        const token = await getToken().catch(() => null);
        if (!token) return;

        try {
            const res = await fetch(`${GATEWAY_URL}/api/v2/identity/admin/counts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return;
            const payload = (await res.json()) as { data?: Partial<AdminCounts> };
            if (payload?.data) {
                setCounts((prev) => ({ ...prev, ...payload.data }));
            }
        } catch {
            // Silently fail — stale counts are acceptable
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    // Initial REST fetch
    useEffect(() => {
        void fetchCounts();
    }, [fetchCounts]);

    // Real-time updates
    const { connected } = useAdminRealtime('counts', (data) => {
        if (data && typeof data === 'object') {
            setCounts((prev) => ({ ...prev, ...(data as Partial<AdminCounts>) }));
            setLoading(false);
        }
    });

    // Fallback polling when WebSocket is disconnected
    useEffect(() => {
        if (!connected) {
            pollTimerRef.current = setInterval(() => {
                void fetchCounts();
            }, POLL_INTERVAL_MS);
        } else {
            if (pollTimerRef.current) {
                clearInterval(pollTimerRef.current);
                pollTimerRef.current = null;
            }
        }

        return () => {
            if (pollTimerRef.current) {
                clearInterval(pollTimerRef.current);
            }
        };
    }, [connected, fetchCounts]);

    return { counts, loading };
}
