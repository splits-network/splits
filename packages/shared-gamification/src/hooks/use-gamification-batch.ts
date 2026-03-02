"use client";

import { useState, useEffect, useRef } from "react";
import type { BadgeAward, EntityLevelInfo } from "../types";

interface FetchClient {
    get<T = any>(endpoint: string, options?: { params?: Record<string, any> }): Promise<T>;
}

interface UseGamificationBatchResult {
    levels: Map<string, EntityLevelInfo>;
    badges: Map<string, BadgeAward[]>;
    loading: boolean;
}

export function useGamificationBatch(
    entityType: string,
    entityIds: string[],
    client: FetchClient | null
): UseGamificationBatchResult {
    const [levels, setLevels] = useState<Map<string, EntityLevelInfo>>(new Map());
    const [badges, setBadges] = useState<Map<string, BadgeAward[]>>(new Map());
    const [loading, setLoading] = useState(false);
    const prevIdsRef = useRef<string>("");

    useEffect(() => {
        if (!client || entityIds.length === 0) return;

        // Dedupe and sort for stable comparison
        const deduped = [...new Set(entityIds)].sort();
        const idsKey = deduped.join(",");

        // Skip if same IDs as last fetch
        if (idsKey === prevIdsRef.current) return;
        prevIdsRef.current = idsKey;

        let cancelled = false;
        setLoading(true);

        async function fetchBatch() {
            try {
                const [levelsRes, badgesRes] = await Promise.allSettled([
                    client!.get<{ data: EntityLevelInfo[] }>("/xp/levels/batch", {
                        params: { entity_type: entityType, entity_ids: deduped.join(",") },
                    }),
                    client!.get<{ data: Record<string, BadgeAward[]> }>("/badges/awards/batch", {
                        params: { entity_type: entityType, entity_ids: deduped.join(",") },
                    }),
                ]);

                if (cancelled) return;

                if (levelsRes.status === "fulfilled" && levelsRes.value?.data) {
                    const map = new Map<string, EntityLevelInfo>();
                    const items = Array.isArray(levelsRes.value.data)
                        ? levelsRes.value.data
                        : [];
                    for (const level of items) {
                        map.set(level.entity_id, level);
                    }
                    setLevels(map);
                }

                if (badgesRes.status === "fulfilled" && badgesRes.value?.data) {
                    const map = new Map<string, BadgeAward[]>();
                    const grouped = badgesRes.value.data;
                    if (typeof grouped === "object" && !Array.isArray(grouped)) {
                        for (const [entityId, awards] of Object.entries(grouped)) {
                            map.set(entityId, awards);
                        }
                    }
                    setBadges(map);
                }
            } catch {
                // Gamification data is non-critical
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchBatch();
        return () => { cancelled = true; };
    }, [entityType, entityIds, client]);

    return { levels, badges, loading };
}
