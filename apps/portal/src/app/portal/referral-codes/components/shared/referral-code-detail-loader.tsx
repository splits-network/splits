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
    const [notFound, setNotFound] = useState(false);
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
            } catch (err: unknown) {
                if (!signal?.cancelled) {
                    const status =
                        err && typeof err === "object" && "status" in err
                            ? (err as { status: number }).status
                            : 0;
                    if (status === 404) {
                        setNotFound(true);
                    } else {
                        console.error(
                            "Failed to fetch referral code:",
                            err,
                        );
                    }
                }
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

    if (notFound) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-12 gap-4">
                <i className="fa-duotone fa-regular fa-circle-exclamation text-3xl text-base-content/30" />
                <p className="text-sm text-base-content/50">
                    This referral code no longer exists.
                </p>
                <button className="btn btn-sm btn-ghost" onClick={onClose}>
                    Close
                </button>
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
