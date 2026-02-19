'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';

type DashboardEvent = {
    type: string;
    eventVersion: number;
    serverTime: string;
    data?: Record<string, unknown>;
};

interface UseDashboardRealtimeOptions {
    enabled?: boolean;
    /** Identity user ID for channel subscription */
    userId?: string;
    /** Called when stats or charts should refresh */
    onStatsUpdate?: () => void;
    onChartsUpdate?: () => void;
    /** Called on reconnection (resync all data) */
    onReconnect?: () => void;
    /** Called when an activity.updated event arrives with the snapshot payload */
    onActivityUpdate?: (snapshot: any) => void;
    /** Additional channels to subscribe to (e.g. 'dashboard:activity') */
    extraChannels?: string[];
}

function buildGatewayUrl(baseUrl: string, token: string) {
    const hasQuery = baseUrl.includes('?');
    const separator = hasQuery ? '&' : '?';
    return `${baseUrl}${separator}token=${encodeURIComponent(token)}`;
}

/**
 * Connects to the analytics-gateway WebSocket for real-time dashboard updates.
 * Follows the same patterns as useChatGateway (ref-based callbacks,
 * exponential backoff reconnection, tab visibility awareness).
 */
export function useDashboardRealtime({
    enabled = true,
    userId,
    onStatsUpdate,
    onChartsUpdate,
    onReconnect,
    onActivityUpdate,
    extraChannels = [],
}: UseDashboardRealtimeOptions) {
    const { getToken } = useAuth();

    const wsRef = useRef<WebSocket | null>(null);
    const closedRef = useRef(false);
    const retryRef = useRef(0);
    const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Store callbacks in refs to avoid dependency churn
    const getTokenRef = useRef(getToken);
    const onStatsRef = useRef(onStatsUpdate);
    const onChartsRef = useRef(onChartsUpdate);
    const onReconnectRef = useRef(onReconnect);
    const onActivityRef = useRef(onActivityUpdate);
    const extraChannelsRef = useRef(extraChannels);

    useEffect(() => { getTokenRef.current = getToken; }, [getToken]);
    useEffect(() => { onStatsRef.current = onStatsUpdate; }, [onStatsUpdate]);
    useEffect(() => { onChartsRef.current = onChartsUpdate; }, [onChartsUpdate]);
    useEffect(() => { onReconnectRef.current = onReconnect; }, [onReconnect]);
    useEffect(() => { onActivityRef.current = onActivityUpdate; }, [onActivityUpdate]);
    useEffect(() => { extraChannelsRef.current = extraChannels; }, [extraChannels]);

    const handleEvent = useCallback((event: DashboardEvent) => {
        if (event.type === 'stats.updated') {
            onStatsRef.current?.();
        }
        if (event.type === 'chart.invalidated' || event.type === 'stats.updated') {
            onChartsRef.current?.();
        }
        if (event.type === 'activity.updated') {
            onActivityRef.current?.(event.data);
        }
    }, []);

    useEffect(() => {
        if (!enabled || !userId) return;

        closedRef.current = false;

        const connect = async () => {
            if (closedRef.current) return;

            const existing = wsRef.current;
            if (existing && (existing.readyState === WebSocket.OPEN || existing.readyState === WebSocket.CONNECTING)) {
                return;
            }

            const token = await getTokenRef.current();
            if (!token || closedRef.current) return;

            const baseUrl =
                process.env.NEXT_PUBLIC_ANALYTICS_GATEWAY_URL || 'ws://127.0.0.1:3025/ws/analytics';
            const url = buildGatewayUrl(baseUrl, token);

            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                retryRef.current = 0;
            };

            ws.onmessage = (message) => {
                try {
                    const payload = JSON.parse(message.data) as DashboardEvent;
                    if (!payload?.type) return;

                    // Subscribe after receiving "hello" — the server registers its
                    // message handler *before* sending hello, so this avoids a race
                    // where an early subscribe sent in onopen gets dropped.
                    if (payload.type === 'hello') {
                        ws.send(JSON.stringify({
                            type: 'subscribe',
                            channels: [`dashboard:${userId}`, ...extraChannelsRef.current],
                        }));
                        onReconnectRef.current?.();
                        return;
                    }

                    handleEvent(payload);
                } catch {
                    // ignore malformed payloads
                }
            };

            ws.onclose = () => {
                if (closedRef.current) return;
                const retry = Math.min(10000, 1000 * 2 ** retryRef.current);
                retryRef.current += 1;
                reconnectTimeout.current = setTimeout(connect, retry);
            };

            ws.onerror = () => {
                // let onclose handle reconnection
            };
        };

        connect();

        const handleVisibility = () => {
            if (document.hidden) return;
            const current = wsRef.current;
            if (!current || current.readyState === WebSocket.CLOSED) {
                connect();
            } else if (current.readyState === WebSocket.OPEN) {
                current.send(JSON.stringify({
                    type: 'subscribe',
                    channels: [`dashboard:${userId}`, ...extraChannelsRef.current],
                }));
                onReconnectRef.current?.();
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            closedRef.current = true;
            document.removeEventListener('visibilitychange', handleVisibility);
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
            wsRef.current?.close();
            wsRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, userId, handleEvent]);
}
