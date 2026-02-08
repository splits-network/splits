"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

interface UseGlobalPresenceOptions {
    enabled?: boolean;
    pingIntervalMs?: number;
    idleTimeoutMs?: number;
    debugLogging?: boolean;
}

/**
 * Global presence tracking hook that monitors user activity across the entire site
 * and maintains online status independent of chat/messaging functionality.
 * 
 * Features:
 * - Tracks mouse movement, keyboard input, page visibility, route changes
 * - 15-minute idle timeout (configurable)
 * - 30-second debounced presence pings (configurable) 
 * - Automatic cleanup on component unmount
 */
export function useGlobalPresence({
    enabled = true,
    pingIntervalMs = 30000, // 30 seconds
    idleTimeoutMs = 900000, // 15 minutes  
    debugLogging = false
}: UseGlobalPresenceOptions = {}) {
    const { getToken, isSignedIn, userId } = useAuth();

    // Refs for tracking state without causing re-renders
    const lastActivityRef = useRef<number>(Date.now());
    const isIdleRef = useRef<boolean>(false);
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastPingRef = useRef<number>(0);

    const log = useCallback((message: string, ...args: any[]) => {
        if (debugLogging) {
            console.log(`[GlobalPresence] ${message}`, ...args);
        }
    }, [debugLogging]);

    // Send presence ping to API
    const sendPresencePing = useCallback(async (status: 'online' | 'idle') => {
        if (!isSignedIn || !userId) return;

        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            await client.post('/presence/ping', {
                status,
                timestamp: new Date().toISOString()
            });

            lastPingRef.current = Date.now();
            log(`Presence ping sent: ${status}`);
        } catch (error) {
            log('Failed to send presence ping:', error);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSignedIn, userId, log]);

    // Update activity timestamp and check idle status
    const updateActivity = useCallback(() => {
        const now = Date.now();
        lastActivityRef.current = now;

        // Check if transitioning from idle to active
        if (isIdleRef.current) {
            isIdleRef.current = false;
            log('User became active from idle state');
            // Send immediate ping when returning from idle
            sendPresencePing('online');
        }
    }, [sendPresencePing, log]);

    // Check if user has been idle too long
    const checkIdleStatus = useCallback(() => {
        const now = Date.now();
        const timeSinceActivity = now - lastActivityRef.current;

        if (timeSinceActivity >= idleTimeoutMs && !isIdleRef.current) {
            isIdleRef.current = true;
            log('User became idle after', Math.round(timeSinceActivity / 1000), 'seconds');
            sendPresencePing('idle');
        }
    }, [idleTimeoutMs, sendPresencePing, log]);

    // Debounced ping function - only ping if enough time has passed
    const debouncedPing = useCallback(() => {
        const now = Date.now();
        const timeSinceLastPing = now - lastPingRef.current;

        // Only ping if we haven't pinged recently and user is active
        if (timeSinceLastPing >= pingIntervalMs && !isIdleRef.current) {
            sendPresencePing('online');
        }

        // Always check idle status regardless of ping timing
        checkIdleStatus();
    }, [pingIntervalMs, sendPresencePing, checkIdleStatus]);

    // Set up activity event listeners
    useEffect(() => {
        if (!enabled || !isSignedIn) {
            return;
        }

        // Activity event handlers
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

        const handleActivity = () => {
            updateActivity();
        };

        // Page visibility change handler
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                updateActivity();
                log('Page became visible');
            }
        };

        // Route change detection (for Next.js App Router)
        const handleRouteChange = () => {
            updateActivity();
            log('Route changed');
        };

        // Add event listeners
        activityEvents.forEach(event => {
            document.addEventListener(event, handleActivity, { passive: true });
        });

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Listen for Next.js route changes via popstate and pushstate
        window.addEventListener('popstate', handleRouteChange);

        // Intercept pushState and replaceState for SPA navigation detection
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

        log('Activity event listeners attached');

        // Cleanup
        return () => {
            activityEvents.forEach(event => {
                document.removeEventListener(event, handleActivity);
            });

            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('popstate', handleRouteChange);

            // Restore original history methods
            history.pushState = originalPushState;
            history.replaceState = originalReplaceState;

            log('Activity event listeners removed');
        };
    }, [enabled, isSignedIn, updateActivity, log]);

    // Set up ping interval
    useEffect(() => {
        if (!enabled || !isSignedIn) {
            return;
        }

        // Send initial presence ping
        sendPresencePing('online');

        // Set up regular ping interval
        pingIntervalRef.current = setInterval(debouncedPing, pingIntervalMs);

        log(`Ping interval started: ${pingIntervalMs}ms`);

        return () => {
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
                pingIntervalRef.current = null;
                log('Ping interval cleared');
            }
        };
    }, [enabled, isSignedIn, pingIntervalMs, sendPresencePing, debouncedPing, log]);

    // Cleanup on unmount - send offline status
    useEffect(() => {
        return () => {
            if (isSignedIn && userId) {
                // Send final offline ping on cleanup
                // Note: This may not always succeed due to page unload timing
                navigator.sendBeacon && navigator.sendBeacon('/api/v2/presence/offline',
                    JSON.stringify({ userId, timestamp: new Date().toISOString() })
                );
            }
        };
    }, [isSignedIn, userId]);

    return {
        isEnabled: enabled && isSignedIn,
        lastActivity: lastActivityRef.current,
        isIdle: isIdleRef.current
    };
}