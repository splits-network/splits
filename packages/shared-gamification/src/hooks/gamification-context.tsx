"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import type { BadgeAward, EntityLevelInfo } from "../types";

interface FetchClient {
    get<T = any>(endpoint: string, options?: { params?: Record<string, any> }): Promise<T>;
}

interface GamificationContextValue {
    /** Register entity IDs that should be fetched. Call this from list parents. */
    registerEntities: (entityType: string, entityIds: string[]) => void;
    /** Get level info for a single entity (returns undefined if not yet loaded) */
    getLevel: (entityId: string) => EntityLevelInfo | undefined;
    /** Get badges for a single entity (returns empty array if not yet loaded) */
    getBadges: (entityId: string) => BadgeAward[];
    /** Whether any gamification data is currently loading */
    loading: boolean;
}

const GamificationContext = createContext<GamificationContextValue>({
    registerEntities: () => {},
    getLevel: () => undefined,
    getBadges: () => [],
    loading: false,
});

interface GamificationProviderProps {
    children: ReactNode;
    client: FetchClient | null;
}

export function GamificationProvider({ children, client }: GamificationProviderProps) {
    const [levels, setLevels] = useState<Map<string, EntityLevelInfo>>(new Map());
    const [badges, setBadges] = useState<Map<string, BadgeAward[]>>(new Map());
    const [loading, setLoading] = useState(false);

    // Track what's been fetched to avoid re-fetching
    const fetchedRef = useRef<Set<string>>(new Set());
    const pendingRef = useRef<Map<string, Set<string>>>(new Map());
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchBatch = useCallback(async () => {
        if (!client) return;

        const toFetch: Map<string, string[]> = new Map();

        for (const [entityType, ids] of pendingRef.current.entries()) {
            const newIds = [...ids].filter(id => !fetchedRef.current.has(`${entityType}:${id}`));
            if (newIds.length > 0) toFetch.set(entityType, newIds);
        }
        pendingRef.current.clear();

        if (toFetch.size === 0) return;

        setLoading(true);

        try {
            for (const [entityType, entityIds] of toFetch.entries()) {
                const idsParam = entityIds.join(",");

                const [levelsRes, badgesRes] = await Promise.allSettled([
                    client.get<{ data: EntityLevelInfo[] }>("/xp/levels/batch", {
                        params: { entity_type: entityType, entity_ids: idsParam },
                    }),
                    client.get<{ data: Record<string, BadgeAward[]> }>("/badges/awards/batch", {
                        params: { entity_type: entityType, entity_ids: idsParam },
                    }),
                ]);

                // Mark as fetched
                for (const id of entityIds) {
                    fetchedRef.current.add(`${entityType}:${id}`);
                }

                if (levelsRes.status === "fulfilled" && levelsRes.value?.data) {
                    const items = Array.isArray(levelsRes.value.data) ? levelsRes.value.data : [];
                    setLevels(prev => {
                        const next = new Map(prev);
                        for (const level of items) {
                            next.set(level.entity_id, level);
                        }
                        return next;
                    });
                }

                if (badgesRes.status === "fulfilled" && badgesRes.value?.data) {
                    const grouped = badgesRes.value.data;
                    if (typeof grouped === "object" && !Array.isArray(grouped)) {
                        setBadges(prev => {
                            const next = new Map(prev);
                            for (const [entityId, awards] of Object.entries(grouped)) {
                                next.set(entityId, awards);
                            }
                            return next;
                        });
                    }
                }
            }
        } catch {
            // Gamification data is non-critical
        } finally {
            setLoading(false);
        }
    }, [client]);

    const registerEntities = useCallback((entityType: string, entityIds: string[]) => {
        if (entityIds.length === 0) return;

        const existing = pendingRef.current.get(entityType) || new Set();
        for (const id of entityIds) {
            if (!fetchedRef.current.has(`${entityType}:${id}`)) {
                existing.add(id);
            }
        }
        pendingRef.current.set(entityType, existing);

        // Debounce — collect all registrations within a tick before fetching
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(fetchBatch, 50);
    }, [fetchBatch]);

    const getLevel = useCallback((entityId: string) => levels.get(entityId), [levels]);
    const getBadges = useCallback((entityId: string) => badges.get(entityId) || [], [badges]);

    // Cleanup timer
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return (
        <GamificationContext.Provider value={{ registerEntities, getLevel, getBadges, loading }}>
            {children}
        </GamificationContext.Provider>
    );
}

export function useGamification() {
    return useContext(GamificationContext);
}
