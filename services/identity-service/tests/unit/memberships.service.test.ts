import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MembershipServiceV2 } from '../../src/v2/memberships/service';
import type { AccessContext } from '../../src/v2/shared/access';

vi.mock('uuid', () => ({ v4: () => 'uuid-1' }));

const platformAdmin: AccessContext = {
    identityUserId: 'user-1',
    candidateId: null,
    recruiterId: null,
    organizationIds: [],
    companyIds: [],
    roles: ['platform_admin'],
    isPlatformAdmin: true,
    error: '',
};

describe('MembershipServiceV2 (unit)', () => {
    const repository = {
        findMemberships: vi.fn(),
        findMembershipById: vi.fn(),
        createMembership: vi.fn(),
        updateMembership: vi.fn(),
        deleteMembership: vi.fn(),
    };
    const eventPublisher = { publish: vi.fn() };
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const resolver = vi.fn();

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('requires platform admin for update', async () => {
        resolver.mockResolvedValue({ ...platformAdmin, isPlatformAdmin: false, roles: [] });
        const service = new MembershipServiceV2(
            repository as any,
            eventPublisher as any,
            logger as any,
            resolver
        );

        await expect(service.updateMembership('clerk-1', 'mem-1', {} as any))
            .rejects.toThrow('Platform admin permissions required');
    });

    it('creates membership and publishes event', async () => {
        resolver.mockResolvedValue(platformAdmin);
        repository.createMembership.mockResolvedValue({
            id: 'mem-1',
            organization_id: 'org-1',
            company_id: null,
            user_id: 'user-1',
            role: 'company_admin',
        });

        const service = new MembershipServiceV2(
            repository as any,
            eventPublisher as any,
            logger as any,
            resolver
        );

        const membership = await service.createMembership('clerk-1', {
            organization_id: 'org-1',
            user_id: 'user-1',
            role: 'company_admin',
        });

        expect(membership.id).toBe('mem-1');
        expect(eventPublisher.publish).toHaveBeenCalledWith(
            'membership.created',
            expect.objectContaining({ membership_id: 'mem-1' })
        );
    });
});
