import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';

vi.mock('../../src/v2/chat/repository', () => {
    return {
        ChatRepository: class {
            constructor() {}
            getSupabase() {
                return {};
            }
            findAttachment() {
                return null;
            }
        },
    };
});

vi.mock('../../src/v2/chat/events', () => {
    return {
        ChatEventPublisher: class {
            constructor() {}
            publishToConversation() {}
            publishToUser() {}
        },
    };
});

vi.mock('../../src/v2/chat/storage', () => {
    return {
        ChatStorageClient: class {
            constructor() {}
            async createSignedUploadUrl() {
                return 'https://upload.local';
            }
            async createSignedDownloadUrl() {
                return 'https://download.local';
            }
        },
    };
});

vi.mock('@splits-network/shared-job-queue', () => {
    return {
        JobQueue: class {
            constructor() {}
            async connect() {}
            async addJob() {}
        },
    };
});

vi.mock('ioredis', () => {
    class RedisMock {
        static instances: RedisMock[] = [];
        store = new Map<string, string>();
        setex = vi.fn(async (key: string, _ttl: number, value: string) => {
            this.store.set(key, value);
            return 'OK';
        });
        mget = vi.fn(async (keys: string[]) =>
            keys.map((key) => this.store.get(key) ?? null)
        );
        pipeline() {
            const commands: Array<() => void> = [];
            return {
                setex: (key: string, _ttl: number, value: string) => {
                    commands.push(() => {
                        this.store.set(key, value);
                    });
                    return this;
                },
                exec: async () => {
                    commands.forEach((fn) => fn());
                    return [];
                },
            };
        }
        on() {}
        async quit() {}
        constructor() {
            RedisMock.instances.push(this);
        }
    }
    return { default: RedisMock };
});

import { registerChatRoutes } from '../../src/v2/chat/routes';

describe('Chat presence routes (integration)', () => {
    const config = {
        supabaseUrl: 'http://supabase',
        supabaseKey: 'key',
        rabbitMqUrl: 'amqp://localhost',
        redisConfig: { host: 'localhost', port: 6379 },
        eventPublisher: { publish: vi.fn() },
    };

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('rejects presence lookup without user context', async () => {
        const app = Fastify();
        await registerChatRoutes(app, config as any);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/chat/presence?userIds=user-1',
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error).toBe('Missing x-clerk-user-id header');
    });

    it('returns offline status when users are not present', async () => {
        const app = Fastify();
        await registerChatRoutes(app, config as any);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/chat/presence?userIds=user-1,user-2',
            headers: {
                'x-clerk-user-id': 'clerk-user-1',
            },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data).toEqual([
            { userId: 'user-1', status: 'offline', lastSeenAt: null },
            { userId: 'user-2', status: 'offline', lastSeenAt: null },
        ]);
    });

    it('updates presence on ping', async () => {
        const app = Fastify();
        await registerChatRoutes(app, config as any);

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/chat/presence/ping',
            headers: {
                'x-clerk-user-id': 'clerk-user-1',
            },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data.status).toBe('ok');
    });
});
