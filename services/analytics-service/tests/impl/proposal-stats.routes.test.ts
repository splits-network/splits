import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';
import { registerProposalStatsRoutes } from '../../src/v2/proposal-stats/routes';

describe('Proposal stats routes (integration)', () => {
    const service = {
        getSummary: vi.fn(),
    };

    it('rejects without user context', async () => {
        const app = Fastify();
        registerProposalStatsRoutes(app, service as any);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/proposal-stats/summary',
        });

        expect(response.statusCode).toBe(401);
        expect(JSON.parse(response.body).error.code).toBe('UNAUTHORIZED');
    });

    it('returns summary', async () => {
        service.getSummary.mockResolvedValue({ total: 1 });
        const app = Fastify();
        registerProposalStatsRoutes(app, service as any);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/proposal-stats/summary',
            headers: { 'x-clerk-user-id': 'clerk-1' },
        });

        expect(response.statusCode).toBe(200);
        expect(service.getSummary).toHaveBeenCalledWith('clerk-1', {});
    });
});
