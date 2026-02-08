import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';
import { registerUserRoutes } from '../../src/v2/users/routes';

describe('User routes (integration)', () => {
    const userService = {
        findUsers: vi.fn(),
        findUserById: vi.fn(),
        findUserByClerkId: vi.fn(),
        updateUser: vi.fn(),
        createUser: vi.fn(),
        registerUser: vi.fn(),
        deleteUser: vi.fn(),
        updateProfileImage: vi.fn(),
        deleteProfileImage: vi.fn(),
    };
    const logError = vi.fn();
    const logInfo = vi.fn();

    it('rejects list without user context', async () => {
        const app = Fastify();
        registerUserRoutes(app, { userService: userService as any, logError, logInfo });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/users',
        });

        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body).error.message).toBe('Failed to list users');
    });

    it('lists users with pagination', async () => {
        userService.findUsers.mockResolvedValue({ data: [], pagination: { total: 0 } });
        const app = Fastify();
        registerUserRoutes(app, { userService: userService as any, logError, logInfo });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/users?page=1&limit=10',
            headers: { 'x-clerk-user-id': 'clerk-1' },
        });

        expect(response.statusCode).toBe(200);
        expect(userService.findUsers).toHaveBeenCalledWith(
            'clerk-1',
            expect.objectContaining({ page: 1, limit: 10 })
        );
    });

    it('creates user', async () => {
        userService.createUser.mockResolvedValue({ id: 'user-1' });
        const app = Fastify();
        registerUserRoutes(app, { userService: userService as any, logError, logInfo });

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/users',
            headers: {
                'x-clerk-user-id': 'clerk-1',
                'content-type': 'application/json',
            },
            payload: { email: 'user@example.com', clerk_user_id: 'clerk-1' },
        });

        expect(response.statusCode).toBe(201);
        expect(userService.createUser).toHaveBeenCalledWith(
            'clerk-1',
            expect.objectContaining({ email: 'user@example.com' })
        );
    });
});
