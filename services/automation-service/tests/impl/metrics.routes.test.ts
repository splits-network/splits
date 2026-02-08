import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';

vi.mock('@supabase/supabase-js', () => ({
    createClient: () => ({}),
}));

import { MarketplaceMetricsServiceV2 } from '../../src/v2/metrics/service';
import { registerMetricRoutes } from '../../src/v2/metrics/routes';

describe('Marketplace metrics routes (integration)', () => {
    const config = {
        supabaseUrl: 'http://supabase',
        supabaseKey: 'key',
        eventPublisher: { publish: vi.fn() },
    };

    it('rejects list without user context', async () => {
        const app = Fastify();
        await registerMetricRoutes(app, config as any);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/marketplace-metrics',
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error.message).toBe('Missing x-clerk-user-id header');
    });

    it('lists metrics with filters', async () => {
        const listSpy = vi.spyOn(MarketplaceMetricsServiceV2.prototype, 'listMetrics')
            .mockResolvedValue({ data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 } } as any);
        const app = Fastify();
        await registerMetricRoutes(app, config as any);

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/marketplace-metrics?filters=%7B%22date_from%22%3A%222025-01-01%22%7D',
            headers: { 'x-clerk-user-id': 'clerk-1' },
        });

        expect(response.statusCode).toBe(200);
        expect(listSpy).toHaveBeenCalledWith(
            'clerk-1',
            expect.objectContaining({ date_from: '2025-01-01' })
        );
    });
});
