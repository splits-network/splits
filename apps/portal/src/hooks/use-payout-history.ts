"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface Payout {
    id: string;
    amount: number;
    currency: string;
    status: string;
    arrival_date: string;
    created: string;
}

interface PayoutsResponse {
    payouts: Payout[];
    has_more: boolean;
}

export interface UsePayoutHistoryReturn {
    payouts: Payout[];
    hasMore: boolean;
    loading: boolean;
    error: string | null;
    loadMore: () => Promise<void>;
}

/* ─── Hook ───────────────────────────────────────────────────────────────── */

export function usePayoutHistory(initialLimit: number = 10): UsePayoutHistoryReturn {
    const { getToken } = useAuth();
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [limit, setLimit] = useState(initialLimit);

    const fetchPayouts = useCallback(async (currentLimit: number, isLoadMore = false) => {
        try {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response = await client.get<{ data: PayoutsResponse }>(
                `/stripe/connect/payouts?limit=${currentLimit}`,
            );

            setPayouts(response.data.payouts);
            setHasMore(response.data.has_more);
        } catch (err: any) {
            if (err?.message?.includes("not found") || err?.status === 404) {
                setPayouts([]);
                setHasMore(false);
            } else {
                setError(err?.message || "Failed to load payout history");
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchPayouts(limit);
    }, [fetchPayouts, limit]);

    const loadMore = useCallback(async () => {
        const newLimit = limit + 10;
        setLimit(newLimit);
        await fetchPayouts(newLimit, true);
    }, [limit, fetchPayouts]);

    return {
        payouts,
        hasMore,
        loading: loading || loadingMore,
        error,
        loadMore,
    };
}
