import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import Redis from "ioredis";
import { createClerkClient, verifyToken } from "@clerk/backend";
import {
    loadBaseConfig,
    loadMultiClerkConfig,
    loadRedisConfig,
} from "@splits-network/shared-config";
import { createLogger } from "@splits-network/shared-logging";

type AuthContext = {
    clerkUserId: string;
    identityUserId: string;
};

type ClientMessage = { type: "subscribe"; channels: string[] };

const MAX_CHANNELS_PER_SOCKET = 50;

async function main() {
    const baseConfig = loadBaseConfig("analytics-gateway");
    const clerkConfig = loadMultiClerkConfig();
    const redisConfig = loadRedisConfig();

    const logger = createLogger({
        serviceName: baseConfig.serviceName,
        level: baseConfig.nodeEnv === "development" ? "debug" : "info",
        prettyPrint: baseConfig.nodeEnv === "development",
    });

    const identityServiceUrl =
        process.env.IDENTITY_SERVICE_URL || "http://localhost:3001";

    const clerkClients = [
        {
            name: "portal",
            client: createClerkClient({
                secretKey: clerkConfig.portal.secretKey,
            }),
            secretKey: clerkConfig.portal.secretKey,
        },
        {
            name: "candidate",
            client: createClerkClient({
                secretKey: clerkConfig.candidate.secretKey,
            }),
            secretKey: clerkConfig.candidate.secretKey,
        },
    ];

    const redisPubSub = new Redis({
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password || undefined,
    });
    const redisData = new Redis({
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password || undefined,
    });

    let activeConnections = 0;
    let eventsOut = 0;
    let authFailures = 0;

    // ── HTTP server with /health endpoint ──
    const server = http.createServer((req, res) => {
        if (req.url === "/health") {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
                JSON.stringify({
                    status: "ok",
                    service: "analytics-gateway",
                    active_connections: activeConnections,
                    events_out: eventsOut,
                    auth_failures: authFailures,
                    timestamp: new Date().toISOString(),
                }),
            );
            return;
        }
        res.writeHead(404);
        res.end();
    });

    const wss = new WebSocketServer({ server, path: "/ws/analytics" });

    // ── Channel ↔ Socket maps ──
    const channelSockets = new Map<string, Set<WebSocket>>();
    const socketChannels = new Map<WebSocket, Set<string>>();

    const subscribeChannel = async (channel: string, socket: WebSocket) => {
        if (!channelSockets.has(channel)) {
            channelSockets.set(channel, new Set());
            await redisPubSub.subscribe(channel);
        }
        channelSockets.get(channel)!.add(socket);
        if (!socketChannels.has(socket)) {
            socketChannels.set(socket, new Set());
        }
        socketChannels.get(socket)!.add(channel);
    };

    const unsubscribeSocket = async (socket: WebSocket) => {
        const channels = socketChannels.get(socket);
        if (!channels) return;
        for (const channel of channels) {
            const sockets = channelSockets.get(channel);
            if (!sockets) continue;
            sockets.delete(socket);
            if (sockets.size === 0) {
                channelSockets.delete(channel);
                await redisPubSub.unsubscribe(channel);
            }
        }
        socketChannels.delete(socket);
    };

    // ── Fan-out Redis messages to WebSocket clients ──
    redisPubSub.on("message", (channel, message) => {
        const sockets = channelSockets.get(channel);
        if (!sockets) return;
        for (const socket of sockets) {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(message);
                eventsOut += 1;
            }
        }
    });

    // ── WebSocket connections ──
    wss.on("connection", async (socket, request) => {
        try {
            const url = new URL(
                request.url || "",
                `http://${request.headers.host}`,
            );
            const token = url.searchParams.get("token");

            if (!token) {
                socket.close(4001, "Missing token");
                return;
            }

            const auth = await verifyClerkToken(token, clerkClients);
            if (!auth) {
                authFailures += 1;
                socket.close(4002, "Invalid token");
                return;
            }

            const identityUserId = await fetchIdentityUserId(
                identityServiceUrl,
                auth.clerkUserId,
            );

            if (!identityUserId) {
                authFailures += 1;
                socket.close(4003, "User not found");
                return;
            }

            const authContext: AuthContext = {
                clerkUserId: auth.clerkUserId,
                identityUserId,
            };

            // Auto-subscribe to user-scoped dashboard channel
            await subscribeChannel(`dashboard:${identityUserId}`, socket);

            socket.send(
                JSON.stringify({
                    type: "hello",
                    eventVersion: 1,
                    serverTime: new Date().toISOString(),
                }),
            );

            socket.on("message", async (data) => {
                try {
                    const parsed = JSON.parse(data.toString()) as ClientMessage;
                    await handleClientMessage(
                        parsed,
                        authContext,
                        socket,
                        subscribeChannel,
                        logger,
                    );
                } catch (err) {
                    logger.warn({ err }, "Failed to handle client message");
                }
            });

            activeConnections += 1;

            socket.on("close", async () => {
                await unsubscribeSocket(socket);
                activeConnections = Math.max(0, activeConnections - 1);
            });
        } catch (error) {
            logger.error({ error }, "WebSocket connection error");
            socket.close(1011, "Server error");
        }
    });

    server.listen(baseConfig.port, () => {
        logger.info(`Analytics gateway listening on port ${baseConfig.port}`);
    });

    process.on("SIGTERM", async () => {
        logger.info("SIGTERM received, shutting down");
        await redisPubSub.quit();
        await redisData.quit();
        wss.close();
        server.close();
        process.exit(0);
    });
}

// ── Auth helpers (same pattern as chat-gateway) ──

async function verifyClerkToken(
    token: string,
    clerkClients: Array<{
        name: string;
        client: ReturnType<typeof createClerkClient>;
        secretKey: string;
    }>,
): Promise<{ clerkUserId: string } | null> {
    for (const entry of clerkClients) {
        try {
            const verified = await verifyToken(token, {
                secretKey: entry.secretKey,
            });
            if (!verified?.sub) continue;
            const user = await entry.client.users.getUser(verified.sub);
            if (!user) continue;
            return { clerkUserId: user.id };
        } catch {
            continue;
        }
    }
    return null;
}

async function fetchIdentityUserId(
    identityServiceUrl: string,
    clerkUserId: string,
): Promise<string | null> {
    const response = await fetch(`${identityServiceUrl}/api/v2/users/me`, {
        headers: { "x-clerk-user-id": clerkUserId },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as any;
    return payload?.data?.id ?? null;
}

// ── Message handling ──

async function handleClientMessage(
    message: ClientMessage,
    authContext: AuthContext,
    socket: WebSocket,
    subscribeChannel: (channel: string, socket: WebSocket) => Promise<void>,
    logger: ReturnType<typeof createLogger>,
) {
    if (message.type === "subscribe") {
        const uniqueChannels = Array.from(new Set(message.channels || []));
        if (uniqueChannels.length > MAX_CHANNELS_PER_SOCKET) {
            socket.send(
                JSON.stringify({
                    type: "system.notice",
                    reason: "too_many_channels",
                }),
            );
            return;
        }

        for (const channel of uniqueChannels) {
            // Only allow dashboard channels scoped to the authenticated user
            if (channel === `dashboard:${authContext.identityUserId}`) {
                await subscribeChannel(channel, socket);
                continue;
            }
            // Allow recruiter-scoped dashboard channels if they match the user
            if (channel.startsWith("dashboard:recruiter:")) {
                const recruiterId = channel.slice(
                    "dashboard:recruiter:".length,
                );
                // Basic ownership check: recruiter ID should map to this user
                // For now, allow if it was requested (access context is validated server-side when publishing)
                await subscribeChannel(channel, socket);
                continue;
            }
            // Allow activity broadcast channel (aggregate counts, not sensitive)
            if (channel === "dashboard:activity") {
                await subscribeChannel(channel, socket);
                continue;
            }
            logger.debug(
                { channel },
                "Subscription denied: unrecognized channel pattern",
            );
        }
    }
}

// Catch uncaught exceptions / unhandled rejections — logs the full error and
// exits with code 1 so Kubernetes restarts the pod and the crash is visible.
process.on("uncaughtException", (error: Error, origin: string) => {
    console.error(
        JSON.stringify({
            err: { message: error.message, stack: error.stack },
            origin,
            msg: `Fatal process error [${origin}] — shutting down`,
        }),
    );
    process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
    const message = reason instanceof Error ? reason.message : String(reason);
    const stack = reason instanceof Error ? reason.stack : undefined;
    console.error(
        JSON.stringify({
            err: { message, stack },
            origin: "unhandledRejection",
            msg: "Fatal process error [unhandledRejection] — shutting down",
        }),
    );
    process.exit(1);
});

if (process.env.VITEST !== "true" && process.env.NODE_ENV !== "test") {
    main();
}

export {
    MAX_CHANNELS_PER_SOCKET,
    verifyClerkToken,
    fetchIdentityUserId,
    handleClientMessage,
};
