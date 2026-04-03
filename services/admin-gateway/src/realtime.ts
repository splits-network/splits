import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { Redis } from 'ioredis';
import { verifyToken } from '@clerk/backend';
import { createClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { createLogger } from '@splits-network/shared-logging';

const MAX_CHANNELS_PER_SOCKET = 10;
const HEARTBEAT_INTERVAL_MS = 30_000;
const STALE_CONNECTION_TIMEOUT_MS = 60_000;

type AdminRealtimeConfig = {
    clerkSecretKey: string;
    supabaseUrl: string;
    supabaseServiceRoleKey: string;
};

type ExtendedSocket = WebSocket & {
    isAlive: boolean;
    lastPong: number;
    adminClerkUserId?: string;
};

const logger = createLogger({ serviceName: 'admin-gateway' });

// ── Token verification ──

async function verifyAdminToken(
    token: string,
    config: AdminRealtimeConfig,
): Promise<{ clerkUserId: string } | null> {
    try {
        const verified = await verifyToken(token, { secretKey: config.clerkSecretKey });
        if (!verified?.sub) return null;

        const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);
        const context = await resolveAccessContext(supabase, verified.sub);

        if (!context.isPlatformAdmin) return null;

        return { clerkUserId: verified.sub };
    } catch {
        return null;
    }
}

// ── Channel subscription helpers ──

const channelSockets = new Map<string, Set<WebSocket>>();
const socketChannels = new Map<WebSocket, Set<string>>();

async function subscribeChannel(channel: string, socket: WebSocket, redisSub: Redis): Promise<void> {
    if (!channelSockets.has(channel)) {
        channelSockets.set(channel, new Set());
        await redisSub.subscribe(channel);
    }
    channelSockets.get(channel)!.add(socket);
    if (!socketChannels.has(socket)) {
        socketChannels.set(socket, new Set());
    }
    socketChannels.get(socket)!.add(channel);
}

async function unsubscribeSocket(socket: WebSocket, redisSub: Redis): Promise<void> {
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
}

// ── Heartbeat ──

function startHeartbeat(wss: WebSocketServer): NodeJS.Timeout {
    return setInterval(() => {
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
}

// ── Main setup ──

const SUPPORT_PRESENCE_TTL_SECONDS = 90;

export function setupRealtimeServer(
    server: http.Server,
    config: AdminRealtimeConfig,
    redis: Redis,
): void {
    // Separate Redis subscriber connection (pub/sub requires dedicated client)
    const redisSub = redis.duplicate();

    const wss = new WebSocketServer({ server, path: '/ws' });

    // Fan-out Redis messages to subscribed WebSocket clients
    redisSub.on('message', (channel, message) => {
        const sockets = channelSockets.get(channel);
        if (!sockets) return;
        // Strip admin: prefix so client receives short channel name
        const shortChannel = channel.replace(/^admin:/, '');
        let parsedData: unknown;
        try {
            parsedData = JSON.parse(message);
        } catch {
            parsedData = message;
        }
        const envelope = JSON.stringify({ channel: shortChannel, data: parsedData });
        for (const socket of sockets) {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(envelope);
            }
        }
    });

    const heartbeatTimer = startHeartbeat(wss);

    wss.on('connection', async (rawSocket, request) => {
        const socket = rawSocket as ExtendedSocket;
        socket.isAlive = true;
        socket.lastPong = Date.now();

        socket.on('pong', () => {
            socket.isAlive = true;
            socket.lastPong = Date.now();
        });

        try {
            const url = new URL(request.url || '', `http://${request.headers.host}`);
            const token = url.searchParams.get('token');

            if (!token) {
                socket.close(4001, 'Missing token');
                return;
            }

            const auth = await verifyAdminToken(token, config);
            if (!auth) {
                socket.close(4001, 'Unauthorized: not a platform admin');
                return;
            }

            socket.adminClerkUserId = auth.clerkUserId;

            socket.send(JSON.stringify({
                type: 'hello',
                serverTime: new Date().toISOString(),
            }));

            socket.on('message', async (data) => {
                try {
                    const parsed = JSON.parse(data.toString()) as {
                        type: string;
                        channels?: string[];
                    };

                    if (parsed.type === 'subscribe' && Array.isArray(parsed.channels)) {
                        const unique = Array.from(new Set(parsed.channels));

                        if (unique.length > MAX_CHANNELS_PER_SOCKET) {
                            socket.send(JSON.stringify({ type: 'system.notice', reason: 'too_many_channels' }));
                            return;
                        }

                        for (const channel of unique) {
                            // Only allow admin-prefixed channels
                            const prefixed = `admin:${channel}`;
                            await subscribeChannel(prefixed, socket, redisSub);
                        }
                    }

                    // Support presence ping — refreshes admin's support presence TTL
                    if (parsed.type === 'support.presence.ping' && socket.adminClerkUserId) {
                        await redis.setex(
                            `presence:support-admin:${socket.adminClerkUserId}`,
                            SUPPORT_PRESENCE_TTL_SECONDS,
                            JSON.stringify({ status: 'online', lastSeenAt: new Date().toISOString() }),
                        );
                        // Notify visitors that admin is online
                        await redis.publish('support:admin-presence', JSON.stringify({
                            type: 'admin.presence',
                            eventVersion: 1,
                            serverTime: new Date().toISOString(),
                            data: { online: true },
                        }));
                    }
                } catch (err) {
                    logger.warn({ err }, 'Failed to handle admin realtime message');
                }
            });

            socket.on('close', async () => {
                // Clean up support admin presence on disconnect
                if (socket.adminClerkUserId) {
                    await redis.del(`presence:support-admin:${socket.adminClerkUserId}`);
                    // Check if any other admins are still online
                    const remainingKeys = await redis.keys('presence:support-admin:*');
                    if (remainingKeys.length === 0) {
                        await redis.publish('support:admin-presence', JSON.stringify({
                            type: 'admin.presence',
                            eventVersion: 1,
                            serverTime: new Date().toISOString(),
                            data: { online: false },
                        }));
                    }
                }
                await unsubscribeSocket(socket, redisSub);
            });
        } catch (error) {
            logger.error({ error }, 'Admin WebSocket connection error');
            socket.close(1011, 'Server error');
        }
    });

    wss.on('close', () => {
        clearInterval(heartbeatTimer);
        void redisSub.quit();
    });

    logger.info('Admin realtime WebSocket server started at /ws');
}
