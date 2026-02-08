import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProposalStatsService } from '../../src/v2/proposal-stats/service';

vi.mock('@splits-network/shared-access-context', () => ({
    resolveAccessContext: vi.fn(),
}));

import { resolveAccessContext } from '@splits-network/shared-access-context';

describe('ProposalStatsService (unit)', () => {
    const repository = {
        getSummary: vi.fn(),
    };
    const cache = {
        get: vi.fn(),
        set: vi.fn(),
        invalidatePattern: vi.fn(),
    };
    const supabase = {} as any;

    beforeEach(() => {
        vi.resetAllMocks();
        (resolveAccessContext as any).mockResolvedValue({ identityUserId: 'user-1' });
    });

    it('returns cached summary when available', async () => {
        cache.get.mockResolvedValue(JSON.stringify({ total: 1 }));
        const service = new ProposalStatsService(repository as any, cache as any, supabase);

        const result = await service.getSummary('clerk-1', {});

        expect(result).toEqual({ total: 1 });
        expect(repository.getSummary).not.toHaveBeenCalled();
    });

    it('fetches summary when cache misses and stores it', async () => {
        cache.get.mockResolvedValue(null);
        repository.getSummary.mockResolvedValue({ total: 2 });
        const service = new ProposalStatsService(repository as any, cache as any, supabase);

        const result = await service.getSummary('clerk-1', {});

        expect(result.total).toBe(2);
        expect(cache.set).toHaveBeenCalled();
    });
});
