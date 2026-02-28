'use client';

import { useEffect, useRef } from 'react';
import { useRealtimeContext } from '../providers/realtime-provider';

type Callback = (data: unknown) => void;

/**
 * Subscribe to an admin real-time channel.
 *
 * Sends a `subscribe` message to the WebSocket server on mount and
 * cleans up the subscription on unmount.
 *
 * @param channel - Channel name (without `admin:` prefix — server adds it)
 * @param callback - Called with parsed message data when a message arrives
 * @returns `{ connected }` — whether the WebSocket is currently connected
 */
export function useAdminRealtime(
    channel: string,
    callback: Callback,
): { connected: boolean } {
    const { subscribe, connected } = useRealtimeContext();
    // Stable ref so callers don't need to memoize the callback
    const callbackRef = useRef<Callback>(callback);
    callbackRef.current = callback;

    useEffect(() => {
        const unsubscribe = subscribe(channel, (data) => {
            callbackRef.current(data);
        });
        return unsubscribe;
    }, [channel, subscribe]);

    return { connected };
}
