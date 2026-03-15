'use client';

import { useEffect } from 'react';
import { useRealtimeContext } from '@/providers/realtime-provider';

const PING_INTERVAL_MS = 30_000;

/**
 * Sends periodic support.presence.ping messages via the admin-gateway
 * WebSocket to keep the admin's support presence alive in Redis.
 * Active only while the support chat page is mounted.
 */
export function useSupportPresence() {
    const { subscribe, send } = useRealtimeContext();

    // Subscribe to the support queue channel for real-time events
    useEffect(() => {
        const unsub = subscribe('admin:support:queue', () => {
            // Queue events handled in page component
        });
        return unsub;
    }, [subscribe]);

    // Send periodic presence pings
    useEffect(() => {
        const ping = () => send({ type: 'support.presence.ping' });

        ping();
        const timer = setInterval(ping, PING_INTERVAL_MS);

        return () => clearInterval(timer);
    }, [send]);
}
