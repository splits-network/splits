"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { usePresence } from "@/hooks/use-presence";

type PresenceStatus = {
    status: "online" | "idle" | "offline";
    lastSeenAt: string | null;
};

type PresenceContextValue = {
    /** Register user IDs for batch presence fetching (call at list level). */
    registerUserIds: (ids: string[]) => void;
    /** Get presence for a single user ID. O(1) lookup. */
    getPresence: (userId: string | null | undefined) => PresenceStatus | undefined;
};

const PresenceContext = createContext<PresenceContextValue | null>(null);

export function PresenceProvider({ children }: { children: React.ReactNode }) {
    const [userIds, setUserIds] = useState<string[]>([]);

    const registerUserIds = useCallback((ids: string[]) => {
        setUserIds((prev) => {
            const set = new Set(prev);
            let changed = false;
            for (const id of ids) {
                if (id && !set.has(id)) {
                    set.add(id);
                    changed = true;
                }
            }
            return changed ? Array.from(set) : prev;
        });
    }, []);

    const presence = usePresence(userIds, { enabled: userIds.length > 0 });

    const getPresence = useCallback(
        (userId: string | null | undefined) => {
            if (!userId) return undefined;
            return presence[userId];
        },
        [presence],
    );

    const value = useMemo(
        () => ({ registerUserIds, getPresence }),
        [registerUserIds, getPresence],
    );

    return (
        <PresenceContext.Provider value={value}>
            {children}
        </PresenceContext.Provider>
    );
}

/**
 * Get presence status for a single user. Must be used within a PresenceProvider.
 * Falls back to a no-op when no provider exists (e.g., actions toolbar in detail panel).
 */
export function usePresenceStatus(userId: string | null | undefined) {
    const ctx = useContext(PresenceContext);
    if (!ctx) return undefined;
    return ctx.getPresence(userId);
}

/**
 * Register user IDs for batch presence fetching. Call at list/page level.
 */
export function useRegisterPresence() {
    const ctx = useContext(PresenceContext);
    if (!ctx) return () => {};
    return ctx.registerUserIds;
}
