import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyClerkToken } from '../../src/index';

vi.mock('@clerk/backend', () => ({
    createClerkClient: () => ({
        users: {
            getUser: vi.fn(),
        },
    }),
    verifyToken: vi.fn(),
}));

import { verifyToken, createClerkClient } from '@clerk/backend';

describe('verifyClerkToken (unit)', () => {
    const clerkClients = [
        { name: 'portal', client: createClerkClient({ secretKey: 'secret1' } as any), secretKey: 'secret1' },
        { name: 'candidate', client: createClerkClient({ secretKey: 'secret2' } as any), secretKey: 'secret2' },
    ];

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('returns clerk user id when token is valid', async () => {
        (verifyToken as any).mockResolvedValue({ sub: 'clerk-1' });
        (clerkClients[0].client.users.getUser as any).mockResolvedValue({ id: 'clerk-1' });

        const result = await verifyClerkToken('token', clerkClients as any);

        expect(result).toEqual({ clerkUserId: 'clerk-1' });
    });

    it('returns null when all clients fail', async () => {
        (verifyToken as any).mockRejectedValue(new Error('bad'));

        const result = await verifyClerkToken('token', clerkClients as any);

        expect(result).toBeNull();
    });
});
