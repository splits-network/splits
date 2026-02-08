import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';

vi.mock('../../src/middleware/auth', () => ({
    requireAuth: () => async (request: any) => {
        request.auth = { clerkUserId: 'clerk-1', memberships: [] };
    },
}));

import { registerAnalyticsRoutes } from '../../src/routes/v2/analytics';

describe('Analytics routes (integration)', () => {
    const analyticsClient = {
        get: vi.fn(),
    };
    const services = {
        get: vi.fn(() => analyticsClient),
    } as any;

    it('proxies stats request with auth headers', async () => {
        analyticsClient.get.mockResolvedValue({ data: { scope: 'recruiter' } });
        const app = Fastify();
        registerAnalyticsRoutes(app, services);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/stats?scope=recruiter',
        });

        expect(response.statusCode).toBe(200);
        expect(analyticsClient.get).toHaveBeenCalledWith(
            '/api/v2/stats?scope=recruiter',
            undefined,
            undefined,
            expect.objectContaining({ 'x-clerk-user-id': 'clerk-1' })
        );
    });
});
