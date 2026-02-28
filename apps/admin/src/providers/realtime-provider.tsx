'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

type Callback = (data: unknown) => void;

type RealtimeContextValue = {
    subscribe: (channel: string, callback: Callback) => () => void;
    connected: boolean;
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

const GATEWAY_URL = process.env.NEXT_PUBLIC_ADMIN_GATEWAY_URL || 'http://localhost:3020';
const MAX_BACKOFF_MS = 30_000;

function toWsUrl(url: string): string {
    return url.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://');
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
    const { getToken } = useAuth();
    const wsRef = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);
    const backoffRef = useRef(1000);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mountedRef = useRef(true);
    const subscriptionsRef = useRef<Map<string, Set<Callback>>>(new Map());
    const subscribedChannelsRef = useRef<Set<string>>(new Set());

    const notifySubscribers = useCallback((channel: string, data: unknown) => {
        const callbacks = subscriptionsRef.current.get(channel);
        if (!callbacks) return;
        for (const cb of callbacks) {
            cb(data);
        }
    }, []);

    const sendSubscriptions = useCallback((ws: WebSocket) => {
        if (ws.readyState !== WebSocket.OPEN) return;
        const channels = Array.from(subscribedChannelsRef.current);
        if (channels.length === 0) return;
        ws.send(JSON.stringify({ type: 'subscribe', channels }));
    }, []);

    const connect = useCallback(async () => {
        if (!mountedRef.current) return;

        const token = await getToken().catch(() => null);
        if (!token || !mountedRef.current) return;

        const wsUrl = `${toWsUrl(GATEWAY_URL)}/ws?token=${encodeURIComponent(token)}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            if (!mountedRef.current) {
                ws.close();
                return;
            }
            backoffRef.current = 1000;
            setConnected(true);
            sendSubscriptions(ws);
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data as string) as {
                    type?: string;
                    channel?: string;
                    data?: unknown;
                };
                if (msg.channel) {
                    notifySubscribers(msg.channel, msg.data ?? msg);
                }
            } catch {
                // Ignore malformed messages
            }
        };

        ws.onclose = () => {
            setConnected(false);
            if (!mountedRef.current) return;
            const delay = Math.min(backoffRef.current, MAX_BACKOFF_MS);
            backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF_MS);
            reconnectTimerRef.current = setTimeout(() => {
                void connect();
            }, delay);
        };

        ws.onerror = () => {
            // onclose will fire after onerror, handling reconnect there
        };
    }, [getToken, notifySubscribers, sendSubscriptions]);

    useEffect(() => {
        mountedRef.current = true;
        void connect();

        return () => {
            mountedRef.current = false;
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
            }
            wsRef.current?.close();
        };
    }, [connect]);

    const subscribe = useCallback((channel: string, callback: Callback): (() => void) => {
        if (!subscriptionsRef.current.has(channel)) {
            subscriptionsRef.current.set(channel, new Set());
        }
        subscriptionsRef.current.get(channel)!.add(callback);

        // Send subscribe message if not already subscribed
        if (!subscribedChannelsRef.current.has(channel)) {
            subscribedChannelsRef.current.add(channel);
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'subscribe', channels: [channel] }));
            }
        }

        return () => {
            const callbacks = subscriptionsRef.current.get(channel);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    subscriptionsRef.current.delete(channel);
                    subscribedChannelsRef.current.delete(channel);
                }
            }
        };
    }, []);

    return (
        <RealtimeContext.Provider value={{ subscribe, connected }}>
            {children}
        </RealtimeContext.Provider>
    );
}

export function useRealtimeContext(): RealtimeContextValue {
    const ctx = useContext(RealtimeContext);
    if (!ctx) {
        throw new Error('useRealtimeContext must be used within RealtimeProvider');
    }
    return ctx;
}
