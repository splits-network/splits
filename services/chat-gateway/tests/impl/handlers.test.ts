import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleClientMessage, publishEphemeral, authorizeConversation } from '../../src/index';

describe('handleClientMessage (integration-ish)', () => {
    const redis = { publish: vi.fn(), setex: vi.fn() };
    const logger = { warn: vi.fn() } as any;
    const subscribeChannel = vi.fn(async () => {});
    const onDenied = vi.fn();

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('publishes typing events', async () => {
        await handleClientMessage(
            { type: 'typing.started', conversationId: 'conv-1' },
            { clerkUserId: 'clerk-1', identityUserId: 'user-1' },
            {} as any,
            'http://chat',
            subscribeChannel,
            onDenied,
            logger,
            redis as any
        );

        expect(redis.publish).toHaveBeenCalled();
    });
});

describe('authorizeConversation (integration-ish)', () => {
    it('returns true when response ok', async () => {
        (global as any).fetch = vi.fn().mockResolvedValue({ ok: true });

        const result = await authorizeConversation('http://chat', 'clerk-1', 'conv-1');

        expect(result).toBe(true);
    });
});

describe('publishEphemeral (integration-ish)', () => {
    it('publishes payload to redis channel', async () => {
        const redis = { publish: vi.fn() };
        await publishEphemeral(redis as any, 'conv:1', { type: 'event' });

        expect(redis.publish).toHaveBeenCalledWith('conv:1', JSON.stringify({ type: 'event' }));
    });
});
