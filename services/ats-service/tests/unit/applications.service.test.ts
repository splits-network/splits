import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApplicationServiceV2 } from '../../src/v2/applications/service';
import { AccessContextResolver } from '@splits-network/shared-access-context';

function mockAccessContext(context: Partial<{
    identityUserId: string;
    candidateId: string | null;
    recruiterId: string | null;
    organizationIds: string[];
    companyIds: string[];
    roles: string[];
    isPlatformAdmin: boolean;
    error: string;
}>) {
    vi.spyOn(AccessContextResolver.prototype, 'resolve').mockResolvedValue({
        identityUserId: 'user-1',
        candidateId: 'cand-1',
        recruiterId: null,
        organizationIds: [],
        companyIds: [],
        roles: [],
        isPlatformAdmin: false,
        error: '',
        ...context,
    });
}

describe('ApplicationServiceV2 (unit)', () => {
    let repository: any;
    let service: ApplicationServiceV2;
    const supabase = {} as any;
    const eventPublisher = { publish: vi.fn() };

    beforeEach(() => {
        vi.restoreAllMocks();
        repository = {
            findApplications: vi.fn().mockResolvedValue({ data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 } }),
            findApplication: vi.fn(),
            createApplication: vi.fn(),
            updateApplication: vi.fn(),
            deleteApplication: vi.fn(),
            linkDocumentToApplication: vi.fn(),
            savePreScreenAnswer: vi.fn(),
            createAuditLog: vi.fn(),
            findActiveRecruiterForCandidate: vi.fn(),
            batchGetAIReviews: vi.fn(),
            batchGetDocuments: vi.fn(),
            getDocumentsForApplication: vi.fn(),
            getAIReviewForApplication: vi.fn(),
            unlinkApplicationDocuments: vi.fn(),
            findCandidateByClerkUserId: vi.fn(),
            findUserByClerkUserId: vi.fn(),
            getSupabase: vi.fn(),
        };
        service = new ApplicationServiceV2(repository, supabase, eventPublisher as any);
    });

    it('creates application with recruiter_proposed when recruiter present', async () => {
        mockAccessContext({ identityUserId: 'user-1', candidateId: 'cand-1', recruiterId: 'rec-1' });
        repository.createApplication.mockResolvedValue({ id: 'app-1', stage: 'recruiter_proposed', job_id: 'job-1' });

        const app = await service.createApplication({ job_id: 'job-1' }, 'clerk-1');

        expect(app.id).toBe('app-1');
        expect(repository.createApplication).toHaveBeenCalledWith(
            expect.objectContaining({ stage: 'recruiter_proposed', candidate_recruiter_id: 'rec-1' }),
            'clerk-1'
        );
        expect(repository.createAuditLog).toHaveBeenCalled();
        expect(eventPublisher.publish).toHaveBeenCalledWith('application.created', expect.any(Object));
    });

    it('creates application with ai_review when no recruiter present', async () => {
        mockAccessContext({ identityUserId: 'user-1', candidateId: 'cand-1', recruiterId: null });
        repository.createApplication.mockResolvedValue({ id: 'app-2', stage: 'ai_review', job_id: 'job-1' });

        const app = await service.createApplication({ job_id: 'job-1' }, 'clerk-1');

        expect(app.stage).toBe('ai_review');
        expect(repository.createApplication).toHaveBeenCalledWith(
            expect.objectContaining({ stage: 'ai_review' }),
            'clerk-1'
        );
    });

    it('rejects invalid stage transitions on update', async () => {
        mockAccessContext({ identityUserId: 'user-1' });
        repository.findApplication.mockResolvedValue({ id: 'app-1', stage: 'draft' });

        await expect(
            service.updateApplication('app-1', { stage: 'submitted' } as any, 'clerk-1')
        ).rejects.toThrow('Invalid stage transition: draft -> submitted');
    });

    it('requires rejection reasons', async () => {
        mockAccessContext({ identityUserId: 'user-1' });
        repository.findApplication.mockResolvedValue({ id: 'app-1', stage: 'screen' });

        await expect(
            service.updateApplication('app-1', { stage: 'rejected' } as any, 'clerk-1')
        ).rejects.toThrow('Decline reason required when rejecting');
    });

    it('submits to recruiter_review when candidate has recruiter', async () => {
        mockAccessContext({ identityUserId: 'user-1' });
        repository.findApplication.mockResolvedValue({
            id: 'app-1',
            stage: 'ai_reviewed',
            candidate_recruiter_id: 'rec-1',
            candidate_id: 'cand-1',
            job_id: 'job-1',
        });
        repository.updateApplication.mockResolvedValue({ id: 'app-1', stage: 'recruiter_review' });

        const result = await service.submitApplication('app-1', 'clerk-1');

        expect(result.application.stage).toBe('recruiter_review');
        expect(eventPublisher.publish).toHaveBeenCalledWith('application.submitted', expect.any(Object));
    });

    it('returns to draft only from ai_reviewed', async () => {
        mockAccessContext({ identityUserId: 'user-1' });
        repository.findApplication.mockResolvedValue({ id: 'app-1', stage: 'submitted' });

        await expect(service.returnToDraft('app-1', 'clerk-1')).rejects.toThrow(
            'Cannot return to draft from stage: submitted'
        );
    });

    it('handles AI review completion and publishes improvement event when needed', async () => {
        repository.updateApplication.mockResolvedValue({});

        await service.handleAIReviewCompleted({
            application_id: 'app-1',
            review_id: 'rev-1',
            recommendation: 'poor_fit',
            concerns: ['gap'],
        });

        expect(repository.updateApplication).toHaveBeenCalledWith('app-1', {
            stage: 'ai_reviewed',
            ai_reviewed: true,
        });
        expect(eventPublisher.publish).toHaveBeenCalledWith('application.ai_reviewed', expect.any(Object));
        expect(eventPublisher.publish).toHaveBeenCalledWith('application.needs_improvement', expect.any(Object));
    });
});
