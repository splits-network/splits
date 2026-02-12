"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { usePathname } from "next/navigation";

interface UseActivityStatusOptions {
    enabled?: boolean;
    idleTimeoutMs?: number;
}

/**
 * Tracks user activity (mouse, keyboard, scroll, visibility, route changes)
 * and returns "online" or "idle". No network calls — purely local detection.
 * Designed to feed status into useChatGateway's presence ping.
 */
export function useActivityStatus({
    enabled = true,
    idleTimeoutMs = 900000, // 15 minutes
}: UseActivityStatusOptions = {}): "online" | "idle" {
    const lastActivityRef = useRef<number>(Date.now());
    const [status, setStatus] = useState<"online" | "idle">("online");
    const pathname = usePathname();

    const updateActivity = useCallback(() => {
        lastActivityRef.current = Date.now();
        setStatus((prev) => (prev === "idle" ? "online" : prev));
    }, []);

    // Route changes count as activity
    useEffect(() => {
        if (enabled) updateActivity();
    }, [pathname, enabled, updateActivity]);

    // DOM activity events + visibility changes
    useEffect(() => {
        if (!enabled) return;

        const activityEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];

        const handleActivity = () => updateActivity();

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                updateActivity();
            }
        };

        activityEvents.forEach((event) => {
            document.addEventListener(event, handleActivity, { passive: true });
        });
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            activityEvents.forEach((event) => {
                document.removeEventListener(event, handleActivity);
            });
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [enabled, updateActivity]);

    // Periodic idle check
    useEffect(() => {
        if (!enabled) return;

        const interval = setInterval(() => {
            const timeSinceActivity = Date.now() - lastActivityRef.current;
            if (timeSinceActivity >= idleTimeoutMs) {
                setStatus("idle");
            }
        }, 10000); // check every 10 seconds

        return () => clearInterval(interval);
    }, [enabled, idleTimeoutMs]);

    return status;
}
