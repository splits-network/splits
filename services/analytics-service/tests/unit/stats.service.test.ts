import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatsServiceV2 } from '../../src/v2/stats/service';

describe('StatsServiceV2 (unit)', () => {
    const repository = {
        getAccessContext: vi.fn(),
        getRecruiterStats: vi.fn(),
        getCandidateStats: vi.fn(),
        getCompanyStats: vi.fn(),
        getPlatformStats: vi.fn(),
    };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('returns recruiter stats when scope is recruiter', async () => {
        repository.getAccessContext.mockResolvedValue({ recruiterId: 'rec-1' });
        repository.getRecruiterStats.mockResolvedValue({ placements: 1 });
        const service = new StatsServiceV2(repository as any);

        const result = await service.getStats('clerk-1', { scope: 'recruiter' });

        expect(result.scope).toBe('recruiter');
        expect(result.metrics.placements).toBe(1);
    });

    it('throws when recruiter profile missing', async () => {
        repository.getAccessContext.mockResolvedValue({ recruiterId: null });
        const service = new StatsServiceV2(repository as any);

        await expect(service.getStats('clerk-1', { scope: 'recruiter' }))
            .rejects.toThrow('Recruiter profile required');
    });
});
