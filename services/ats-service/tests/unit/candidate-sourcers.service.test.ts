import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CandidateSourcerServiceV2 } from '../../src/v2/candidate-sourcers/service';

vi.mock('@splits-network/shared-access-context', () => {
    return {
        resolveAccessContext: vi.fn(),
    };
});

import { resolveAccessContext } from '@splits-network/shared-access-context';

describe('CandidateSourcerServiceV2 (unit)', () => {
    let repository: any;
    let service: CandidateSourcerServiceV2;
    const eventPublisher = { publish: vi.fn() };
    const supabase = {} as any;

    beforeEach(() => {
        vi.restoreAllMocks();
        repository = {
            list: vi.fn().mockResolvedValue({ data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 } }),
            findById: vi.fn().mockResolvedValue(null),
            findByCandidate: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue({ candidate_id: 'cand-1', sourcer_recruiter_id: 'rec-1', sourced_at: new Date(), protection_expires_at: new Date() }),
            update: vi.fn(),
            delete: vi.fn(),
            checkProtectionStatus: vi.fn().mockResolvedValue({ has_protection: false }),
        };
        service = new CandidateSourcerServiceV2(repository, eventPublisher as any, supabase);
    });

    it('requires candidate_id and sourcer_recruiter_id', async () => {
        (resolveAccessContext as any).mockResolvedValue({ roles: ['recruiter'], isPlatformAdmin: false, recruiterId: 'rec-1', identityUserId: 'user-1' });
        await expect(service.create('clerk-1', { candidate_id: '', sourcer_recruiter_id: '' } as any)).rejects.toThrow(
            'candidate_id and sourcer_recruiter_id are required'
        );
    });

    it('prevents recruiters assigning other recruiters', async () => {
        (resolveAccessContext as any).mockResolvedValue({ roles: ['recruiter'], isPlatformAdmin: false, recruiterId: 'rec-1', identityUserId: 'user-1' });
        await expect(
            service.create('clerk-1', { candidate_id: 'cand-1', sourcer_recruiter_id: 'rec-2' } as any)
        ).rejects.toThrow('Recruiters can only assign sourcer credit to themselves');
    });
});
