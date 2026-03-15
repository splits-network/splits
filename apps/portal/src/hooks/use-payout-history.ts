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

export interface UsePayoutHistoryReturn {
    payouts: Payout[];
    loading: boolean;
    error: string | null;
}

/* ─── Hook ───────────────────────────────────────────────────────────────── */

export function usePayoutHistory(limit: number = 25): UsePayoutHistoryReturn {
    const { getToken } = useAuth();
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPayouts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response = await client.get<{ data: Payout[] }>(
                `/stripe/connect/payouts?limit=${limit}`,
            );

            setPayouts(response.data ?? []);
        } catch (err: any) {
            if (err?.message?.includes("not found") || err?.status === 404) {
                setPayouts([]);
            } else {
                setError(err?.message || "Failed to load payout history");
            }
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [limit]);

    useEffect(() => {
        fetchPayouts();
    }, [fetchPayouts]);

    return {
        payouts,
        loading,
        error,
    };
}
