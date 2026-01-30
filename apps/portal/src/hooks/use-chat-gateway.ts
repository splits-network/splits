import { useEffect, useMemo, useRef } from "react";

type ChatGatewayEvent = {
    type: string;
    eventVersion: number;
    serverTime: string;
    data?: Record<string, any>;
};

type UseChatGatewayOptions = {
    enabled?: boolean;
    channels: string[];
    getToken: () => Promise<string | null>;
    onEvent?: (event: ChatGatewayEvent) => void;
    onReconnect?: () => void;
};

function buildGatewayUrl(baseUrl: string, token: string) {
    const hasQuery = baseUrl.includes("?");
    const separator = hasQuery ? "&" : "?";
    return `${baseUrl}${separator}token=${encodeURIComponent(token)}`;
}

export function useChatGateway({
    enabled = true,
    channels,
    getToken,
    onEvent,
    onReconnect,
}: UseChatGatewayOptions) {
    const wsRef = useRef<WebSocket | null>(null);
    const closedRef = useRef(false);
    const retryRef = useRef(0);
    const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const channelsRef = useRef<string[]>([]);

    const normalizedChannels = useMemo(() => {
        const unique = new Set(channels.filter(Boolean));
        return Array.from(unique);
    }, [channels.join("|")]);

    useEffect(() => {
        channelsRef.current = normalizedChannels;
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(
                JSON.stringify({
                    type: "subscribe",
                    channels: channelsRef.current,
                }),
            );
        }
    }, [normalizedChannels.join("|")]);

    useEffect(() => {
        if (!enabled || normalizedChannels.length === 0) return;

        closedRef.current = false;

        const connect = async () => {
            if (closedRef.current) return;
            const token = await getToken();
            if (!token) return;

            const baseUrl =
                process.env.NEXT_PUBLIC_CHAT_GATEWAY_URL ||
                "ws://localhost:3020";
            const url = buildGatewayUrl(baseUrl, token);

            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                retryRef.current = 0;
                ws.send(
                    JSON.stringify({
                        type: "subscribe",
                        channels: channelsRef.current,
                    }),
                );
                onReconnect?.();
            };

            ws.onmessage = (message) => {
                try {
                    const payload = JSON.parse(message.data) as ChatGatewayEvent;
                    if (!payload?.type || payload.type === "hello") return;
                    onEvent?.(payload);
                } catch {
                    // Ignore malformed payloads.
                }
            };

            ws.onclose = () => {
                if (closedRef.current) return;
                const retry = Math.min(10000, 1000 * 2 ** retryRef.current);
                retryRef.current += 1;
                reconnectTimeout.current = setTimeout(connect, retry);
            };

            ws.onerror = () => {
                ws.close();
            };
        };

        connect();

        const handleVisibility = () => {
            if (document.hidden) return;
            const current = wsRef.current;
            if (!current || current.readyState === WebSocket.CLOSED) {
                connect();
            } else if (current.readyState === WebSocket.OPEN) {
                current.send(
                    JSON.stringify({
                        type: "subscribe",
                        channels: channelsRef.current,
                    }),
                );
                onReconnect?.();
            }
        };

        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            closedRef.current = true;
            document.removeEventListener("visibilitychange", handleVisibility);
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }
            wsRef.current?.close();
        };
    }, [enabled, normalizedChannels.join("|"), getToken, onEvent, onReconnect]);
}
