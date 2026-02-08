import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';
import { registerStatsRoutes } from '../../src/v2/stats/routes';

describe('Stats routes (integration)', () => {
    const statsService = {
        getStats: vi.fn(),
    };

    it('rejects without user context', async () => {
        const app = Fastify();
        registerStatsRoutes(app, { statsService: statsService as any });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/stats',
        });

        expect(response.statusCode).toBe(403);
        expect(JSON.parse(response.body).error.message).toContain('User context required for analytics access');
    });

    it('returns stats data', async () => {
        statsService.getStats.mockResolvedValue({ scope: 'recruiter', range: {}, metrics: {} });
        const app = Fastify();
        registerStatsRoutes(app, { statsService: statsService as any });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/stats?scope=recruiter&range=7d',
            headers: { 'x-clerk-user-id': 'clerk-1' },
        });

        expect(response.statusCode).toBe(200);
        expect(statsService.getStats).toHaveBeenCalledWith('clerk-1', expect.objectContaining({
            scope: 'recruiter',
            range: '7d',
        }));
    });
});
