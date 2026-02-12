"use client";

import { useEffect, useRef, useCallback, useState } from "react";

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
    const lastUrlRef = useRef<string>(typeof window !== "undefined" ? window.location.href : "");
    const [status, setStatus] = useState<"online" | "idle">("online");

    const updateActivity = useCallback(() => {
        lastActivityRef.current = Date.now();
        setStatus((prev) => (prev === "idle" ? "online" : prev));
    }, []);

    useEffect(() => {
        if (!enabled) return;

        const activityEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];

        const handleActivity = () => updateActivity();

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                updateActivity();
            }
        };

        const handleRouteChange = () => {
            const currentUrl = window.location.href;
            if (currentUrl !== lastUrlRef.current) {
                lastUrlRef.current = currentUrl;
                updateActivity();
            }
        };

        activityEvents.forEach((event) => {
            document.addEventListener(event, handleActivity, { passive: true });
        });
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("popstate", handleRouteChange);

        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
        history.pushState = function (...args) {
            originalPushState.apply(this, args);
            handleRouteChange();
        };
        history.replaceState = function (...args) {
            originalReplaceState.apply(this, args);
            handleRouteChange();
        };

        return () => {
            activityEvents.forEach((event) => {
                document.removeEventListener(event, handleActivity);
            });
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("popstate", handleRouteChange);
            history.pushState = originalPushState;
            history.replaceState = originalReplaceState;
        };
    }, [enabled, updateActivity]);

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
