'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export type SupportGatewayEvent = {
    type: string;
    eventVersion?: number;
    serverTime?: string;
    data?: Record<string, any>;
    channel?: string;
};

interface UseSupportGatewayOptions {
    enabled?: boolean;
    gatewayUrl?: string;
    sessionId?: string;
    getToken?: () => Promise<string | null>;
    onEvent?: (event: SupportGatewayEvent) => void;
}

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 10_000;

export function useSupportGateway(options: UseSupportGatewayOptions) {
    const {
        enabled = true,
        gatewayUrl,
        sessionId,
        getToken,
        onEvent,
    } = options;

    const [connected, setConnected] = useState(false);
    const [adminOnline, setAdminOnline] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttempt = useRef(0);
    const onEventRef = useRef(onEvent);
    onEventRef.current = onEvent;

    const connect = useCallback(async () => {
        if (!enabled || !gatewayUrl) return;

        const url = new URL(gatewayUrl);
        url.pathname = '/ws/support';

        // Try token first, fall back to session_id
        if (getToken) {
            try {
                const token = await getToken();
                if (token) url.searchParams.set('token', token);
            } catch {
                // Fall through to session_id
            }
        }

        if (sessionId && !url.searchParams.has('token')) {
            url.searchParams.set('session_id', sessionId);
        }

        if (!url.searchParams.has('token') && !url.searchParams.has('session_id')) {
            return; // No auth available
        }

        const ws = new WebSocket(url.toString());
        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
            reconnectAttempt.current = 0;
        };

        ws.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data) as SupportGatewayEvent;

                if (parsed.type === 'hello' && parsed.data) {
                    setAdminOnline(parsed.data.adminOnline ?? false);
                }

                if (parsed.type === 'admin.presence' && parsed.data) {
                    setAdminOnline(parsed.data.online ?? false);
                }

                onEventRef.current?.(parsed);
            } catch {
                // Ignore parse errors
            }
        };

        ws.onclose = () => {
            setConnected(false);
            wsRef.current = null;

            if (enabled) {
                const delay = Math.min(
                    RECONNECT_BASE_MS * Math.pow(2, reconnectAttempt.current),
                    RECONNECT_MAX_MS,
                );
                reconnectAttempt.current += 1;
                setTimeout(connect, delay);
            }
        };

        ws.onerror = () => {
            ws.close();
        };
    }, [enabled, gatewayUrl, sessionId, getToken]);

    useEffect(() => {
        connect();
        return () => {
            wsRef.current?.close();
        };
    }, [connect]);

    // Reconnect on tab visibility change
    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === 'visible' && !wsRef.current) {
                connect();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [connect]);

    const subscribe = useCallback((channels: string[]) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'subscribe', channels }));
        }
    }, []);

    const sendTyping = useCallback((conversationId: string, started: boolean) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: started ? 'typing.started' : 'typing.stopped',
                conversationId,
            }));
        }
    }, []);

    return { connected, adminOnline, subscribe, sendTyping };
}
