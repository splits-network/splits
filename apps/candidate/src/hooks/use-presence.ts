import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

type PresenceStatus = {
    status: "online" | "idle" | "offline";
    lastSeenAt: string | null;
};

type UsePresenceOptions = {
    enabled?: boolean;
    refreshIntervalMs?: number;
};

const cache = new Map<string, PresenceStatus>();

export function usePresence(
    userIds: Array<string | null | undefined>,
    options: UsePresenceOptions = {},
) {
    const { getToken } = useAuth();
    const { enabled = true, refreshIntervalMs = 30000 } = options;

    const normalizedIds = useMemo(() => {
        const unique = new Set<string>();
        userIds.forEach((id) => {
            if (id) unique.add(id);
        });
        return Array.from(unique);
    }, [userIds.filter(Boolean).join("|")]);

    const [presence, setPresence] = useState<Record<string, PresenceStatus>>(
        () => {
            const initial: Record<string, PresenceStatus> = {};
            normalizedIds.forEach((id) => {
                const cached = cache.get(id);
                if (cached) {
                    initial[id] = cached;
                }
            });
            return initial;
        },
    );

    useEffect(() => {
        if (normalizedIds.length === 0) return;
        setPresence((prev) => {
            const next = { ...prev };
            normalizedIds.forEach((id) => {
                const cached = cache.get(id);
                if (cached) {
                    next[id] = cached;
                }
            });
            return next;
        });
    }, [normalizedIds.join("|")]);

    const fetchPresence = useCallback(async () => {
        if (!enabled || normalizedIds.length === 0) return;
        const token = await getToken();
        if (!token) return;
        const client = createAuthenticatedClient(token);
        const response: any = await client.get("/chat/presence", {
            params: { userIds: normalizedIds.join(",") },
        });
        const data = (response?.data || []) as Array<{
            userId: string;
            status: "online" | "idle" | "offline";
            lastSeenAt: string | null;
        }>;
        const updates: Record<string, PresenceStatus> = {};
        data.forEach((item) => {
            const s = item?.status;
            const entry: PresenceStatus = {
                status: s === "online" ? "online" : s === "idle" ? "idle" : "offline",
                lastSeenAt: item?.lastSeenAt ?? null,
            };
            updates[item.userId] = entry;
            cache.set(item.userId, entry);
        });
        setPresence((prev) => ({ ...prev, ...updates }));
    }, [enabled, getToken, normalizedIds.join("|")]);

    useEffect(() => {
        fetchPresence();
        if (!enabled || refreshIntervalMs <= 0) return;
        const interval = setInterval(fetchPresence, refreshIntervalMs);
        return () => clearInterval(interval);
    }, [enabled, fetchPresence, refreshIntervalMs]);

    return presence;
}
