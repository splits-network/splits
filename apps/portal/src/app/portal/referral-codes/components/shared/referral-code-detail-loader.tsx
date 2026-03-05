"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { RecruiterCode } from "../../types";
import { ReferralCodeDetail } from "./referral-code-detail";

export function ReferralCodeDetailLoader({
    codeId,
    onClose,
    onRefresh,
}: {
    codeId: string;
    onClose: () => void;
    onRefresh?: () => void;
}) {
    const { getToken } = useAuth();
    const [code, setCode] = useState<RecruiterCode | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchDetail = useCallback(
        async (id: string, signal?: { cancelled: boolean }) => {
            try {
                const token = await getToken();
                if (!token || signal?.cancelled) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get<{ data: RecruiterCode }>(
                    `/recruiter-codes/${id}`,
                );
                if (!signal?.cancelled) setCode(res.data);
            } catch (err) {
                console.error("Failed to fetch referral code:", err);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    useEffect(() => {
        const signal = { cancelled: false };
        setLoading(true);
        fetchDetail(codeId, signal).finally(() => {
            if (!signal.cancelled) setLoading(false);
        });
        return () => {
            signal.cancelled = true;
        };
    }, [codeId, refreshKey, fetchDetail]);

    const handleRefresh = useCallback(() => {
        setRefreshKey((k) => k + 1);
        onRefresh?.();
    }, [onRefresh]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary mb-4 block" />
                    <span className="text-sm uppercase tracking-[0.2em] font-bold text-base-content/40">
                        Loading referral code...
                    </span>
                </div>
            </div>
        );
    }

    if (!code) return null;

    return (
        <ReferralCodeDetail
            code={code}
            onClose={onClose}
            onRefresh={handleRefresh}
        />
    );
}
