import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';

vi.mock('../../src/middleware/auth', () => ({
    requireAuth: () => async (request: any) => {
        request.auth = { clerkUserId: 'clerk-1', memberships: [] };
    },
}));

import { registerIdentityRoutes } from '../../src/routes/v2/identity';

describe('Identity routes (integration)', () => {
    const identityClient = {
        get: vi.fn(),
        patch: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
    };
    const services = {
        get: vi.fn(() => identityClient),
    } as any;

    it('proxies /users/me to identity service', async () => {
        identityClient.get.mockResolvedValue({ data: { id: 'user-1' } });
        const app = Fastify();
        registerIdentityRoutes(app, services);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/users/me',
        });

        expect(response.statusCode).toBe(200);
        expect(identityClient.get).toHaveBeenCalledWith(
            '/api/v2/users/me',
            undefined,
            undefined,
            expect.objectContaining({ 'x-clerk-user-id': 'clerk-1' })
        );
    });
});
