"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { EnrichedMatch } from "@splits-network/shared-types";

export function useTopMatches() {
    const { getToken } = useAuth();
    const [matches, setMatches] = useState<EnrichedMatch[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const api = createAuthenticatedClient(token);
            const response: any = await api.get("/matches", {
                params: {
                    status: "active",
                    sort_by: "match_score",
                    sort_order: "desc",
                    limit: 5,
                },
            });

            const data = response?.data;
            setMatches(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("[TopMatches] Failed to load:", err);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { matches, loading, refresh };
}
