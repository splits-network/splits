import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecruiterCandidateServiceV2 } from '../../src/v2/recruiter-candidates/service';

describe('RecruiterCandidateServiceV2 (unit)', () => {
    const repository = {
        findRecruiterCandidates: vi.fn(),
        findRecruiterCandidate: vi.fn(),
        createRecruiterCandidate: vi.fn(),
        updateRecruiterCandidate: vi.fn(),
        deleteRecruiterCandidate: vi.fn(),
        findByInvitationToken: vi.fn(),
        resendInvitation: vi.fn(),
    };
    const eventPublisher = { publish: vi.fn() };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('rejects create without recruiter/candidate ids', async () => {
        const service = new RecruiterCandidateServiceV2(repository as any, eventPublisher as any);

        await expect(service.createRecruiterCandidate({ recruiter_id: '', candidate_id: '' }, 'clerk-1'))
            .rejects.toMatchObject({ statusCode: 400 });
    });

    it('creates relationship and publishes events', async () => {
        repository.createRecruiterCandidate.mockResolvedValue({
            id: 'rel-1',
            recruiter_id: 'rec-1',
            candidate_id: 'cand-1',
        });
        const service = new RecruiterCandidateServiceV2(repository as any, eventPublisher as any);

        const relationship = await service.createRecruiterCandidate(
            { recruiter_id: 'rec-1', candidate_id: 'cand-1' },
            'clerk-1'
        );

        expect(relationship.id).toBe('rel-1');
        expect(eventPublisher.publish).toHaveBeenCalledWith('recruiter_candidate.created', {
            relationship_id: 'rel-1',
            recruiter_id: 'rec-1',
            candidate_id: 'cand-1',
        });
        expect(eventPublisher.publish).toHaveBeenCalledWith(
            'candidate.invited',
            expect.objectContaining({
                relationship_id: 'rel-1',
                recruiter_id: 'rec-1',
                candidate_id: 'cand-1',
            })
        );
    });

    it('rejects invalid status updates', async () => {
        const service = new RecruiterCandidateServiceV2(repository as any, eventPublisher as any);

        await expect(service.updateRecruiterCandidate('rel-1', { status: 'pending' } as any, 'clerk-1'))
            .rejects.toMatchObject({ statusCode: 400 });
    });

    it('resends invitation when flag is set', async () => {
        const service = new RecruiterCandidateServiceV2(repository as any, eventPublisher as any);
        const resendSpy = vi.spyOn(service, 'resendInvitation').mockResolvedValue({ id: 'rel-1' } as any);

        const result = await service.updateRecruiterCandidate('rel-1', { resend_invitation: true } as any, 'clerk-1');

        expect(resendSpy).toHaveBeenCalledWith('rel-1', 'clerk-1');
        expect(result).toMatchObject({ id: 'rel-1' });
    });

    it('throws on expired invitation token', async () => {
        repository.findByInvitationToken.mockResolvedValue({
            id: 'rel-1',
            invitation_expires_at: new Date(Date.now() - 1000).toISOString(),
            consent_given: false,
            declined_at: null,
            recruiter: { user: { name: 'Rec', email: 'r@example.com' } },
            recruiter_id: 'rec-1',
            candidate_id: 'cand-1',
        });
        const service = new RecruiterCandidateServiceV2(repository as any, eventPublisher as any);

        await expect(service.getInvitationByToken('token-1')).rejects.toMatchObject({
            statusCode: 410,
        });
    });

    it('accepts invitation and publishes events', async () => {
        repository.findByInvitationToken.mockResolvedValue({
            id: 'rel-1',
            invitation_expires_at: null,
            consent_given: false,
            declined_at: null,
            recruiter_id: 'rec-1',
            candidate_id: 'cand-1',
        });
        repository.updateRecruiterCandidate.mockResolvedValue({
            id: 'rel-1',
            recruiter_id: 'rec-1',
            candidate_id: 'cand-1',
            consent_given_at: new Date().toISOString(),
        });
        const service = new RecruiterCandidateServiceV2(repository as any, eventPublisher as any);

        const result = await service.acceptInvitationByToken('token-1', { userId: 'user-1' });

        expect(result.success).toBe(true);
        expect(eventPublisher.publish).toHaveBeenCalledWith('candidate.link_requested', {
            candidate_id: 'cand-1',
            user_id: 'user-1',
            recruiter_id: 'rec-1',
        });
        expect(eventPublisher.publish).toHaveBeenCalledWith('candidate.sourcer_assignment_requested', {
            candidate_id: 'cand-1',
            recruiter_id: 'rec-1',
            source_method: 'invitation_accepted',
        });
        expect(eventPublisher.publish).toHaveBeenCalledWith(
            'candidate.consent_given',
            expect.objectContaining({ relationship_id: 'rel-1' })
        );
    });

    it('declines invitation and publishes event', async () => {
        repository.findByInvitationToken.mockResolvedValue({
            id: 'rel-1',
            consent_given: false,
            declined_at: null,
            recruiter_id: 'rec-1',
            candidate_id: 'cand-1',
        });
        repository.updateRecruiterCandidate.mockResolvedValue({
            id: 'rel-1',
            recruiter_id: 'rec-1',
            candidate_id: 'cand-1',
            declined_at: new Date().toISOString(),
            declined_reason: 'no',
        });
        const service = new RecruiterCandidateServiceV2(repository as any, eventPublisher as any);

        const result = await service.declineInvitationByToken('token-1', { reason: 'no' });

        expect(result.success).toBe(true);
        expect(eventPublisher.publish).toHaveBeenCalledWith(
            'candidate.consent_declined',
            expect.objectContaining({ relationship_id: 'rel-1' })
        );
    });
});
