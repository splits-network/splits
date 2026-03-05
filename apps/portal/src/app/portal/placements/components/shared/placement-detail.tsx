"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { Placement } from "../../types";
import { PlacementDetailPanel } from "./placement-detail-panel";

/* ─── Detail Loading Wrapper ───────────────────────────────────────────── */

export function DetailLoader({
    placementId,
    onClose,
    onRefresh,
}: {
    placementId: string;
    onClose: () => void;
    onRefresh?: () => void;
}) {
    const { getToken } = useAuth();
    const [placement, setPlacement] = useState<Placement | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchDetail = useCallback(
        async (id: string, signal?: { cancelled: boolean }) => {
            try {
                const token = await getToken();
                if (!token || signal?.cancelled) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get<{ data: Placement }>(
                    `/placements/${id}`,
                    { params: { include: "candidate,job,company,splits" } },
                );
                if (!signal?.cancelled) setPlacement(res.data);
            } catch (err) {
                console.error("Failed to fetch placement detail:", err);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [],
    );

    useEffect(() => {
        const signal = { cancelled: false };
        setLoading(true);

        fetchDetail(placementId, signal).finally(() => {
            if (!signal.cancelled) setLoading(false);
        });

        return () => {
            signal.cancelled = true;
        };
    }, [placementId, refreshKey, fetchDetail]);

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
                        Loading placement...
                    </span>
                </div>
            </div>
        );
    }

    if (!placement) return null;

    return (
        <PlacementDetailPanel
            placement={placement}
            onClose={onClose}
            onRefresh={handleRefresh}
        />
    );
}
