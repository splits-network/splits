import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarketplaceMetricsServiceV2 } from '../../src/v2/metrics/service';

describe('MarketplaceMetricsServiceV2 (unit)', () => {
    const repository = {
        findMetrics: vi.fn(),
        findMetric: vi.fn(),
        createMetric: vi.fn(),
        updateMetric: vi.fn(),
        deleteMetric: vi.fn(),
    };
    const resolver = vi.fn();
    const publisher = { publish: vi.fn() };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('rejects non-admin access', async () => {
        resolver.mockResolvedValue({ isPlatformAdmin: false });
        const service = new MarketplaceMetricsServiceV2(repository as any, resolver, publisher as any);

        await expect(service.listMetrics('clerk-1', { page: 1, limit: 10 }))
            .rejects.toThrow('Platform admin permissions required');
    });

    it('creates metric and publishes event', async () => {
        resolver.mockResolvedValue({ isPlatformAdmin: true });
        repository.createMetric.mockResolvedValue({ id: 'metric-1', date: '2025-01-01' });
        const service = new MarketplaceMetricsServiceV2(repository as any, resolver, publisher as any);

        const result = await service.createMetric('clerk-1', {
            date: '2025-01-01',
            total_placements: 1,
            total_applications: 2,
            total_earnings_cents: 1000,
            active_recruiters: 3,
            active_jobs: 4,
            health_score: 90,
        });

        expect(result.id).toBe('metric-1');
        expect(publisher.publish).toHaveBeenCalledWith(
            'automation.metrics.created',
            expect.objectContaining({ metric_id: 'metric-1' })
        );
    });
});
