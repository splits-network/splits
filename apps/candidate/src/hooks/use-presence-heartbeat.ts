"use client";

import { useAuth } from "@clerk/nextjs";
import { useUserProfile } from "@/contexts";
import { useChatGateway } from "./use-chat-gateway";
import { useActivityStatus } from "./use-activity-status";

/**
 * Global presence heartbeat — connects to chat-gateway WebSocket on every
 * authenticated page so the user always appears online/idle in Redis.
 *
 * Mount once in the authenticated layout. The chat/messages pages will open
 * their own useChatGateway connections for conversation channels; this one
 * only subscribes to the user's personal channel for presence pings.
 */
export function usePresenceHeartbeat() {
    const { getToken } = useAuth();
    const { profile } = useUserProfile();
    const activityStatus = useActivityStatus();

    const userId = profile?.id;

    if (typeof window !== "undefined" && userId) {
        console.log("[presence-heartbeat] active", { userId, activityStatus });
    }

    useChatGateway({
        enabled: Boolean(userId),
        channels: userId ? [`user:${userId}`] : [],
        getToken,
        presencePingEnabled: true,
        presencePingIntervalMs: 30000,
        presenceStatus: activityStatus,
    });
}
