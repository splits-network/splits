import { describe, it, expect, vi } from 'vitest';
import { setPresence, PRESENCE_TTL_SECONDS } from '../../src/index';

describe('setPresence (unit)', () => {
    it('sets redis key with ttl', async () => {
        const redis = { setex: vi.fn() };
        await setPresence(redis as any, 'user-1');

        expect(redis.setex).toHaveBeenCalledWith(
            'presence:user:user-1',
            PRESENCE_TTL_SECONDS,
            expect.stringContaining('"status":"online"')
        );
    });
});
