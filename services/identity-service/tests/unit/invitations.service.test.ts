import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvitationServiceV2 } from '../../src/v2/invitations/service';
import type { AccessContext } from '../../src/v2/shared/access';

vi.mock('uuid', () => ({ v4: () => 'uuid-1' }));

const companyAdmin: AccessContext = {
    identityUserId: 'user-1',
    candidateId: null,
    recruiterId: null,
    organizationIds: ['org-1'],
    companyIds: ['company-1'],
    roles: ['company_admin'],
    isPlatformAdmin: false,
    error: '',
};

describe('InvitationServiceV2 (unit)', () => {
    const repository = {
        findInvitations: vi.fn(),
        findInvitationById: vi.fn(),
        createInvitation: vi.fn(),
        updateInvitation: vi.fn(),
        deleteInvitation: vi.fn(),
    };
    const userRepository = {
        findUserByClerkId: vi.fn(),
        updateUser: vi.fn(),
    };
    const membershipRepository = {
        createMembership: vi.fn(),
    };
    const eventPublisher = { publish: vi.fn() };
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const resolver = vi.fn();

    beforeEach(() => {
        vi.resetAllMocks();
        resolver.mockResolvedValue(companyAdmin);
    });

    it('requires email for createInvitation', async () => {
        const service = new InvitationServiceV2(
            repository as any,
            userRepository as any,
            membershipRepository as any,
            eventPublisher as any,
            logger as any,
            resolver
        );

        await expect(service.createInvitation('clerk-1', { organization_id: 'org-1', role: 'company_admin' }))
            .rejects.toThrow('Email is required');
    });

    it('prevents duplicate pending invitations', async () => {
        repository.findInvitations.mockResolvedValue({ data: [{ id: 'inv-1' }], total: 1 });
        const service = new InvitationServiceV2(
            repository as any,
            userRepository as any,
            membershipRepository as any,
            eventPublisher as any,
            logger as any,
            resolver
        );

        await expect(service.createInvitation('clerk-1', {
            email: 'test@example.com',
            organization_id: 'org-1',
            role: 'company_admin',
        })).rejects.toThrow('An invitation has already been sent');
    });

    it('accepts invitation and creates membership', async () => {
        userRepository.findUserByClerkId.mockResolvedValue({ id: 'user-1' });
        repository.findInvitationById.mockResolvedValue({
            id: 'inv-1',
            organization_id: 'org-1',
            company_id: 'company-1',
            email: 'test@example.com',
            role: 'company_admin',
            status: 'pending',
            expires_at: new Date(Date.now() + 100000).toISOString(),
        });
        membershipRepository.createMembership.mockResolvedValue({ id: 'mem-1' });

        const service = new InvitationServiceV2(
            repository as any,
            userRepository as any,
            membershipRepository as any,
            eventPublisher as any,
            logger as any,
            resolver
        );

        await service.acceptInvitation('inv-1', 'clerk-1', 'test@example.com');

        expect(repository.updateInvitation).toHaveBeenCalledWith(
            'inv-1',
            expect.objectContaining({ status: 'accepted' })
        );
        expect(eventPublisher.publish).toHaveBeenCalledWith(
            'invitation.accepted',
            expect.objectContaining({ invitation_id: 'inv-1' })
        );
        expect(eventPublisher.publish).toHaveBeenCalledWith(
            'membership.created',
            expect.objectContaining({ membership_id: 'mem-1' })
        );
    });
});
