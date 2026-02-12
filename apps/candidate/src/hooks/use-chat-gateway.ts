import { useCallback, useEffect, useMemo, useRef } from "react";

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
  presencePingEnabled?: boolean;
  presencePingIntervalMs?: number;
  presenceStatus?: "online" | "idle";
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
  presencePingEnabled = true,
  presencePingIntervalMs = 30000,
  presenceStatus = "online",
}: UseChatGatewayOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const closedRef = useRef(false);
  const retryRef = useRef(0);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const presenceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelsRef = useRef<string[]>([]);
  const presenceStatusRef = useRef(presenceStatus);
  useEffect(() => { presenceStatusRef.current = presenceStatus; }, [presenceStatus]);

  // store callbacks in refs so effect deps don't churn
  const getTokenRef = useRef(getToken);
  const onEventRef = useRef(onEvent);
  const onReconnectRef = useRef(onReconnect);

  useEffect(() => { getTokenRef.current = getToken; }, [getToken]);
  useEffect(() => { onEventRef.current = onEvent; }, [onEvent]);
  useEffect(() => { onReconnectRef.current = onReconnect; }, [onReconnect]);

  const normalizedChannels = useMemo(() => {
    const unique = new Set(channels.filter(Boolean));
    return Array.from(unique);
  }, [channels.join("|")]);

  useEffect(() => {
    channelsRef.current = normalizedChannels;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "subscribe", channels: channelsRef.current }));
    }
  }, [normalizedChannels.join("|")]);

  const sendPresencePing = useCallback(() => {
    if (!presencePingEnabled) return;
    const current = wsRef.current;
    if (!current || current.readyState !== WebSocket.OPEN) return;
    current.send(JSON.stringify({ type: "presence.ping", status: presenceStatusRef.current }));
  }, [presencePingEnabled]);

  useEffect(() => {
    if (!enabled || normalizedChannels.length === 0) return;

    closedRef.current = false;

    const connect = async () => {
      if (closedRef.current) return;

      // prevent creating a new socket if one is already connecting/open
      const existing = wsRef.current;
      if (existing && (existing.readyState === WebSocket.OPEN || existing.readyState === WebSocket.CONNECTING)) {
        return;
      }

      const token = await getTokenRef.current();
      if (!token || closedRef.current) return;

      const baseUrl =
        process.env.NEXT_PUBLIC_CHAT_GATEWAY_URL || "ws://127.0.0.1:3020/ws/chat";
      const url = buildGatewayUrl(baseUrl, token);

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        retryRef.current = 0;
        ws.send(JSON.stringify({ type: "subscribe", channels: channelsRef.current }));
        onReconnectRef.current?.();
        sendPresencePing();
        if (presencePingEnabled) {
          if (presenceIntervalRef.current) clearInterval(presenceIntervalRef.current);
          presenceIntervalRef.current = setInterval(sendPresencePing, presencePingIntervalMs);
        }
      };

      ws.onmessage = (message) => {
        try {
          const payload = JSON.parse(message.data) as ChatGatewayEvent;
          if (!payload?.type || payload.type === "hello") return;
          onEventRef.current?.(payload);
        } catch {
          // ignore malformed payloads
        }
      };

      ws.onclose = (e) => {
        console.log("[portal-chat-gateway] WebSocket closed", { code: e.code, reason: e.reason });
        if (presenceIntervalRef.current) {
          clearInterval(presenceIntervalRef.current);
          presenceIntervalRef.current = null;
        }
        if (closedRef.current) return;
        const retry = Math.min(10000, 1000 * 2 ** retryRef.current);
        retryRef.current += 1;
        reconnectTimeout.current = setTimeout(connect, retry);
      };

      ws.onerror = (e) => {
        console.log("[portal-chat-gateway] WebSocket error occurred", e);
        // do NOT call ws.close() here
      };
    };

    connect();

    const handleVisibility = () => {
      if (document.hidden) return;
      const current = wsRef.current;
      if (!current || current.readyState === WebSocket.CLOSED) {
        connect();
      } else if (current.readyState === WebSocket.OPEN) {
        current.send(JSON.stringify({ type: "subscribe", channels: channelsRef.current }));
        onReconnectRef.current?.();
        sendPresencePing();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      closedRef.current = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (presenceIntervalRef.current) clearInterval(presenceIntervalRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [enabled, normalizedChannels.join("|"), presencePingEnabled, presencePingIntervalMs, sendPresencePing]);

  // Send an immediate ping when presence status changes (idle ↔ online)
  useEffect(() => {
    sendPresencePing();
  }, [presenceStatus, sendPresencePing]);
}
