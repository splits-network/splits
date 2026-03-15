import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import Redis from 'ioredis';
import { verifyToken } from '@clerk/backend';
import { loadBaseConfig, loadMultiClerkConfig, loadRedisConfig } from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';

type ClientMessage =
    | { type: 'subscribe'; channels: string[] }
    | { type: 'typing.started'; conversationId: string }
    | { type: 'typing.stopped'; conversationId: string }
    | { type: 'presence.ping' };

const MAX_CHANNELS_PER_SOCKET = 10;
const HEARTBEAT_INTERVAL_MS = 30_000;
const STALE_CONNECTION_TIMEOUT_MS = 60_000;

type ExtendedSocket = WebSocket & {
    isAlive: boolean;
    lastPong: number;
    sessionId?: string;
    clerkUserId?: string;
};

async function main() {
    const baseConfig = loadBaseConfig('support-gateway');
    const redisConfig = loadRedisConfig();

    // Clerk config is optional — anonymous visitors don't need it
    let clerkSecretKeys: string[] = [];
    try {
        const clerkConfig = loadMultiClerkConfig();
        clerkSecretKeys = [
            clerkConfig.portal.secretKey,
            clerkConfig.candidate.secretKey,
        ].filter(Boolean);
    } catch {
        // No Clerk config — all connections will be anonymous
    }

    const logger = createLogger({
        serviceName: baseConfig.serviceName,
        level: baseConfig.nodeEnv === 'development' ? 'debug' : 'info',
        prettyPrint: baseConfig.nodeEnv === 'development',
    });

    const redisSub = new Redis({
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

    // ── Channel management ──

    const channelSockets = new Map<string, Set<WebSocket>>();
    const socketChannels = new Map<WebSocket, Set<string>>();

    const subscribeChannel = async (channel: string, socket: WebSocket) => {
        if (!channelSockets.has(channel)) {
            channelSockets.set(channel, new Set());
            await redisSub.subscribe(channel);
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
                await redisSub.unsubscribe(channel);
            }
        }
        socketChannels.delete(socket);
    };

    // ── Redis fan-out ──

    redisSub.on('message', (channel, message) => {
        const sockets = channelSockets.get(channel);
        if (!sockets) return;
        for (const socket of sockets) {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(message);
            }
        }
    });

    // ── Auth verification ──

    async function verifyClerkJwt(token: string): Promise<string | null> {
        for (const secretKey of clerkSecretKeys) {
            try {
                const verified = await verifyToken(token, { secretKey });
                if (verified?.sub) return verified.sub;
            } catch {
                continue;
            }
        }
        return null;
    }

    // ── HTTP server ──

    const server = http.createServer(async (req, res) => {
        if (req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'ok',
                service: 'support-gateway',
                active_connections: activeConnections,
                timestamp: new Date().toISOString(),
            }));
            return;
        }

        // Admin presence check (REST endpoint for widget polling fallback)
        if (req.url === '/admin-status') {
            const keys = await redisData.keys('presence:support-admin:*');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ data: { online: keys.length > 0 } }));
            return;
        }

        res.writeHead(404);
        res.end();
    });

    // ── WebSocket server ──

    const wss = new WebSocketServer({ server, path: '/ws/support' });

    // Heartbeat
    const heartbeatTimer = setInterval(() => {
        const now = Date.now();
        wss.clients.forEach((rawSocket) => {
            const socket = rawSocket as ExtendedSocket;
            if (!socket.isAlive || now - socket.lastPong > STALE_CONNECTION_TIMEOUT_MS) {
                socket.terminate();
                return;
            }
            socket.isAlive = false;
            socket.ping();
        });
    }, HEARTBEAT_INTERVAL_MS);

    wss.on('connection', async (rawSocket, request) => {
        const socket = rawSocket as ExtendedSocket;
        socket.isAlive = true;
        socket.lastPong = Date.now();
        activeConnections += 1;

        socket.on('pong', () => {
            socket.isAlive = true;
            socket.lastPong = Date.now();
        });

        try {
            const url = new URL(request.url || '', `http://${request.headers.host}`);
            const token = url.searchParams.get('token');
            const sessionId = url.searchParams.get('session_id');

            // Dual auth: Clerk JWT or anonymous session_id
            if (token) {
                const clerkUserId = await verifyClerkJwt(token);
                if (clerkUserId) {
                    socket.clerkUserId = clerkUserId;
                }
            }

            if (sessionId) {
                socket.sessionId = sessionId;
            }

            if (!socket.clerkUserId && !socket.sessionId) {
                socket.close(4001, 'Missing authentication: provide token or session_id');
                return;
            }

            // Check admin presence
            const adminKeys = await redisData.keys('presence:support-admin:*');
            const adminOnline = adminKeys.length > 0;

            // Auto-subscribe to admin presence channel
            await subscribeChannel('support:admin-presence', socket);

            socket.send(JSON.stringify({
                type: 'hello',
                eventVersion: 1,
                serverTime: new Date().toISOString(),
                data: { adminOnline },
            }));

            socket.on('message', async (data) => {
                try {
                    const parsed = JSON.parse(data.toString()) as ClientMessage;

                    if (parsed.type === 'subscribe' && Array.isArray(parsed.channels)) {
                        const unique = Array.from(new Set(parsed.channels)).slice(0, MAX_CHANNELS_PER_SOCKET);
                        for (const channel of unique) {
                            // Only allow support: prefixed channels
                            const prefixed = channel.startsWith('support:') ? channel : `support:${channel}`;
                            await subscribeChannel(prefixed, socket);
                        }
                    }

                    if (parsed.type === 'typing.started' || parsed.type === 'typing.stopped') {
                        const channel = `support:conv:${parsed.conversationId}`;
                        const payload = JSON.stringify({
                            type: parsed.type,
                            eventVersion: 1,
                            serverTime: new Date().toISOString(),
                            data: {
                                conversationId: parsed.conversationId,
                                senderType: 'visitor',
                            },
                        });
                        await redisData.publish(channel, payload);
                        // Also notify admin
                        await redisData.publish(`admin:support:queue`, payload);
                    }
                } catch (err) {
                    logger.warn({ err }, 'Failed to handle support client message');
                }
            });

            socket.on('close', async () => {
                activeConnections -= 1;
                await unsubscribeSocket(socket);
            });
        } catch (error) {
            logger.error({ error }, 'Support WebSocket connection error');
            socket.close(1011, 'Server error');
            activeConnections -= 1;
        }
    });

    wss.on('close', () => {
        clearInterval(heartbeatTimer);
        void redisSub.quit();
        void redisData.quit();
    });

    server.listen(baseConfig.port, '0.0.0.0', () => {
        logger.info(`Support gateway listening on port ${baseConfig.port} (ws://0.0.0.0:${baseConfig.port}/ws/support)`);
    });
}

main();
