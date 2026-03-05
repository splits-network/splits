"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { EnrichedMatch } from "../../types";
import { MatchDetailPanel } from "./match-detail-panel";

export function MatchDetailLoader({
    matchId,
    isPartner,
    onClose,
    onDismiss,
    dismissing,
}: {
    matchId: string;
    isPartner: boolean;
    onClose?: () => void;
    onDismiss?: (id: string) => void;
    dismissing?: boolean;
}) {
    const { getToken } = useAuth();
    const [match, setMatch] = useState<EnrichedMatch | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchDetail = useCallback(
        async (id: string, signal?: { cancelled: boolean }) => {
            try {
                const token = await getToken();
                if (!token || signal?.cancelled) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get<{ data: EnrichedMatch }>(
                    `/matches/${id}`,
                );
                if (!signal?.cancelled) setMatch(res.data);
            } catch (err) {
                console.error("Failed to fetch match:", err);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    useEffect(() => {
        const signal = { cancelled: false };
        setLoading(true);
        fetchDetail(matchId, signal).finally(() => {
            if (!signal.cancelled) setLoading(false);
        });
        return () => {
            signal.cancelled = true;
        };
    }, [matchId, refreshKey, fetchDetail]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary mb-4 block" />
                    <span className="text-sm uppercase tracking-[0.2em] font-bold text-base-content/40">
                        Loading match...
                    </span>
                </div>
            </div>
        );
    }

    if (!match) return null;

    return (
        <MatchDetailPanel
            match={match}
            isPartner={isPartner}
            onClose={onClose}
            onDismiss={onDismiss}
            dismissing={dismissing}
        />
    );
}
