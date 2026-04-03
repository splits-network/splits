"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { Application } from "../../types";
import { ApplicationDetailPanel } from "./application-detail-panel";

/* ─── Detail Loading Wrapper ─────────────────────────────────────────────── */

export function DetailLoader({
    applicationId,
    onClose,
    onRefresh,
}: {
    applicationId: string;
    onClose: () => void;
    onRefresh?: () => void;
}) {
    const { getToken } = useAuth();
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchDetail = useCallback(
        async (id: string, signal?: { cancelled: boolean }) => {
            try {
                const token = await getToken();
                if (!token || signal?.cancelled) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get<{ data: Application }>(
                    `/applications/${id}/view/detail`,
                );
                if (!signal?.cancelled) setApplication(res.data);
            } catch (err) {
                console.error("Failed to fetch application detail:", err);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [],
    );

    useEffect(() => {
        const signal = { cancelled: false };
        setLoading(true);

        fetchDetail(applicationId, signal).finally(() => {
            if (!signal.cancelled) setLoading(false);
        });

        return () => {
            signal.cancelled = true;
        };
    }, [applicationId, refreshKey, fetchDetail]);

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
                        Loading application...
                    </span>
                </div>
            </div>
        );
    }

    if (!application) return null;

    return (
        <ApplicationDetailPanel
            application={application}
            onClose={onClose}
            onRefresh={handleRefresh}
        />
    );
}
