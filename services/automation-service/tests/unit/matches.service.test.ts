import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CandidateMatchServiceV2 } from '../../src/v2/matches/service';

describe('CandidateMatchServiceV2 (unit)', () => {
    const repository = {
        findMatches: vi.fn(),
        findMatch: vi.fn(),
        createMatch: vi.fn(),
        updateMatch: vi.fn(),
        deleteMatch: vi.fn(),
    };
    const resolver = vi.fn();
    const publisher = { publish: vi.fn() };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('rejects non-admin access', async () => {
        resolver.mockResolvedValue({ isPlatformAdmin: false });
        const service = new CandidateMatchServiceV2(repository as any, resolver, publisher as any);

        await expect(service.listMatches('clerk-1', { page: 1, limit: 10 }))
            .rejects.toThrow('Platform admin permissions required');
    });

    it('creates match and publishes event', async () => {
        resolver.mockResolvedValue({ isPlatformAdmin: true });
        repository.createMatch.mockResolvedValue({ id: 'match-1', candidate_id: 'cand-1', job_id: 'job-1' });
        const service = new CandidateMatchServiceV2(repository as any, resolver, publisher as any);

        const result = await service.createMatch('clerk-1', {
            candidate_id: 'cand-1',
            job_id: 'job-1',
            match_score: 85,
            match_reason: 'Strong fit',
        } as any);

        expect(result.id).toBe('match-1');
        expect(publisher.publish).toHaveBeenCalledWith(
            'automation.matches.created',
            expect.objectContaining({ match_id: 'match-1' })
        );
    });
});
