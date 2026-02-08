import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchIdentityUserId } from '../../src/index';

describe('fetchIdentityUserId (unit)', () => {
    beforeEach(() => {
        (global as any).fetch = vi.fn();
    });

    it('returns null when response is not ok', async () => {
        (global as any).fetch.mockResolvedValue({ ok: false });

        const result = await fetchIdentityUserId('http://identity', 'clerk-1');

        expect(result).toBeNull();
    });

    it('returns user id when response ok', async () => {
        (global as any).fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: { id: 'user-1' } }),
        });

        const result = await fetchIdentityUserId('http://identity', 'clerk-1');

        expect(result).toBe('user-1');
    });
});
