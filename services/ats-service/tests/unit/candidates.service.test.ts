import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CandidateServiceV2 } from '../../src/v2/candidates/service';
import { AccessContextResolver } from '@splits-network/shared-access-context';

function mockAccessContext(context: Partial<{
    identityUserId: string;
    candidateId: string | null;
    recruiterId: string | null;
    organizationIds: string[];
    roles: string[];
    isPlatformAdmin: boolean;
    error: string;
}>) {
    vi.spyOn(AccessContextResolver.prototype, 'resolve').mockResolvedValue({
        identityUserId: 'user-1',
        candidateId: null,
        recruiterId: null,
        organizationIds: [],
        roles: [],
        isPlatformAdmin: false,
        error: '',
        ...context,
    });
}

describe('CandidateServiceV2 (unit)', () => {
    let repository: any;
    let service: CandidateServiceV2;
    const supabase = {} as any;
    const eventPublisher = { publish: vi.fn() };

    beforeEach(() => {
        vi.restoreAllMocks();
        repository = {
            findCandidates: vi.fn().mockResolvedValue({ data: [], pagination: { total: 0 } }),
            findCandidate: vi.fn(),
            findCandidateByClerkId: vi.fn(),
            createCandidate: vi.fn(),
            updateCandidate: vi.fn(),
            deleteCandidate: vi.fn(),
            getAccessContext: vi.fn(),
            getCandidateDashboardStats: vi.fn(),
            getRecentCandidateApplications: vi.fn(),
            getCandidatePrimaryResume: vi.fn(),
            getCandidateResumes: vi.fn(),
            setCandidatePrimaryResume: vi.fn(),
            clearCandidatePrimaryResume: vi.fn(),
        };
        service = new CandidateServiceV2(repository, supabase, eventPublisher as any);
    });

    it('validates email format on create', async () => {
        mockAccessContext({ identityUserId: 'user-1' });
        await expect(
            service.createCandidate({ full_name: 'Test User', email: 'bad-email' }, 'clerk-1')
        ).rejects.toThrow('Invalid email format');
    });

    it('rejects updates when user lacks permission', async () => {
        mockAccessContext({ identityUserId: 'user-1', candidateId: 'cand-2', recruiterId: null });
        repository.findCandidate.mockResolvedValue({ id: 'cand-1' });

        await expect(
            service.updateCandidate('cand-1', { full_name: 'New Name' }, 'clerk-1')
        ).rejects.toThrow('You do not have permission to update this candidate');
    });

    it('returns zero stats when no candidate context', async () => {
        repository.getAccessContext.mockResolvedValue({ candidateId: null });

        const stats = await service.getCandidateDashboardStats('clerk-1');

        expect(stats).toEqual({
            applications: 0,
            interviews: 0,
            offers: 0,
            active_relationships: 0,
        });
    });

    it('blocks primary resume update when not candidate or admin', async () => {
        mockAccessContext({ candidateId: 'cand-2', isPlatformAdmin: false });
        await expect(
            service.setPrimaryResume('cand-1', 'doc-1', 'clerk-1')
        ).rejects.toThrow('You do not have permission to update this candidate\'s primary resume');
    });
});
