import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarketplaceMetricsServiceV2 } from '../../src/v2/marketplace-metrics/service';

vi.mock('@splits-network/shared-access-context', () => ({
    resolveAccessContext: vi.fn(),
}));

import { resolveAccessContext } from '@splits-network/shared-access-context';

describe('MarketplaceMetricsServiceV2 (unit)', () => {
    const repository = {
        list: vi.fn(),
        findById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };
    const supabase = {} as any;
    const publisher = { publish: vi.fn() };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('rejects non-admin access', async () => {
        (resolveAccessContext as any).mockResolvedValue({ isPlatformAdmin: false });
        const service = new MarketplaceMetricsServiceV2(repository as any, supabase, publisher as any);

        await expect(service.list('clerk-1', { page: 1, limit: 10 }))
            .rejects.toThrow('Platform admin permissions required');
    });

    it('creates metric and publishes event', async () => {
        (resolveAccessContext as any).mockResolvedValue({ isPlatformAdmin: true });
        repository.create.mockResolvedValue({ id: 'metric-1', date: '2025-01-01' });
        const service = new MarketplaceMetricsServiceV2(repository as any, supabase, publisher as any);

        const result = await service.create('clerk-1', {
            date: '2025-01-01',
            total_placements: 1,
            total_applications: 2,
            total_earnings_cents: 1000,
            active_recruiters: 3,
            active_jobs: 4,
            health_score: 80,
        });

        expect(result.id).toBe('metric-1');
        expect(publisher.publish).toHaveBeenCalledWith(
            'analytics.marketplace_metric.created',
            expect.objectContaining({ metricId: 'metric-1' })
        );
    });
});
