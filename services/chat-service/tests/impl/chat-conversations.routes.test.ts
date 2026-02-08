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
        on() {}
        async quit() {}
        setex = vi.fn(async () => 'OK');
        mget = vi.fn(async () => []);
        pipeline() {
            return { setex: () => this, exec: async () => [] };
        }
    }
    return { default: RedisMock };
});

import { ChatServiceV2 } from '../../src/v2/chat/service';
import { registerChatRoutes } from '../../src/v2/chat/routes';

describe('Chat conversation routes (integration)', () => {
    const config = {
        supabaseUrl: 'http://supabase',
        supabaseKey: 'key',
        rabbitMqUrl: 'amqp://localhost',
        redisConfig: { host: 'localhost', port: 6379 },
        eventPublisher: { publish: vi.fn() },
    };

    beforeEach(() => {
        vi.restoreAllMocks();
        vi.spyOn(ChatServiceV2.prototype, 'createOrFindConversation').mockResolvedValue({ id: 'conv-1' } as any);
        vi.spyOn(ChatServiceV2.prototype, 'listConversationsWithParticipants').mockResolvedValue({ data: [], total: 0 } as any);
        vi.spyOn(ChatServiceV2.prototype, 'listMessages').mockResolvedValue([] as any);
        vi.spyOn(ChatServiceV2.prototype, 'resyncConversationWithParticipants').mockResolvedValue({
            conversation: {},
            participant: {},
            messages: [],
        } as any);
        vi.spyOn(ChatServiceV2.prototype, 'sendMessage').mockResolvedValue({ id: 'msg-1' } as any);
        vi.spyOn(ChatServiceV2.prototype, 'acceptConversation').mockResolvedValue();
    });

    it('rejects conversation creation without user context', async () => {
        const app = Fastify();
        await registerChatRoutes(app, config as any);

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/chat/conversations',
            payload: { participantUserId: 'user-2' },
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error).toBe('Missing x-clerk-user-id header');
    });

    it('creates conversation with clerk user id', async () => {
        const app = Fastify();
        await registerChatRoutes(app, config as any);

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/chat/conversations',
            headers: {
                'x-clerk-user-id': 'clerk-user-1',
                'content-type': 'application/json',
            },
            payload: { participantUserId: 'user-2' },
        });

        expect(response.statusCode).toBe(201);
        expect(JSON.parse(response.body).data.id).toBe('conv-1');
    });

    it('lists conversations with pagination envelope', async () => {
        const app = Fastify();
        await registerChatRoutes(app, config as any);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/chat/conversations?filter=inbox&limit=10',
            headers: { 'x-clerk-user-id': 'clerk-user-1' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.pagination.limit).toBe(10);
    });

    it('sends message and returns 201', async () => {
        const app = Fastify();
        await registerChatRoutes(app, config as any);

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/chat/conversations/conv-1/messages',
            headers: {
                'x-clerk-user-id': 'clerk-user-1',
                'content-type': 'application/json',
            },
            payload: { body: 'hello' },
        });

        expect(response.statusCode).toBe(201);
        expect(JSON.parse(response.body).data.id).toBe('msg-1');
    });
});
