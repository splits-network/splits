import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';
import { registerMarketplaceMetricsRoutes } from '../../src/v2/marketplace-metrics/routes';

describe('Marketplace metrics routes (integration)', () => {
    const marketplaceMetricsService = {
        list: vi.fn(),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };

    it('rejects list without user context', async () => {
        const app = Fastify();
        await registerMarketplaceMetricsRoutes(app, { marketplaceMetricsService: marketplaceMetricsService as any });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/marketplace-metrics',
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error.message).toContain('User context required for analytics access');
    });

    it('lists marketplace metrics with filters', async () => {
        marketplaceMetricsService.list.mockResolvedValue({ data: [], pagination: { total: 0 } });
        const app = Fastify();
        await registerMarketplaceMetricsRoutes(app, { marketplaceMetricsService: marketplaceMetricsService as any });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/marketplace-metrics?limit=5&page=2',
            headers: { 'x-clerk-user-id': 'clerk-1' },
        });

        expect(response.statusCode).toBe(200);
        expect(marketplaceMetricsService.list).toHaveBeenCalledWith(
            'clerk-1',
            expect.objectContaining({ page: 2, limit: 5 })
        );
    });
});
