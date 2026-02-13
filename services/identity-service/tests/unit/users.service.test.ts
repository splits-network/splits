import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserServiceV2 } from '../../src/v2/users/service';
import type { AccessContext } from '../../src/v2/shared/access';

vi.mock('uuid', () => ({ v4: () => 'uuid-1' }));

const accessContext: AccessContext = {
    identityUserId: 'user-1',
    candidateId: null,
    recruiterId: null,
    organizationIds: [],
    orgWideOrganizationIds: [],
    companyIds: [],
    roles: [],
    isPlatformAdmin: false,
    error: '',
};

describe('UserServiceV2 (unit)', () => {
    const repository = {
        findUserByClerkId: vi.fn(),
        updateUser: vi.fn(),
        createUser: vi.fn(),
        findUsers: vi.fn(),
        findUserById: vi.fn(),
        create: vi.fn(),
        deleteUser: vi.fn(),
    };
    const eventPublisher = { publish: vi.fn() };
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const resolver = vi.fn();

    beforeEach(() => {
        vi.resetAllMocks();
        resolver.mockResolvedValue(accessContext);
    });

    it('syncs existing user and publishes updated event when changes present', async () => {
        repository.findUserByClerkId.mockResolvedValue({
            id: 'user-1',
            email: 'old@example.com',
            name: 'Old',
        });

        const service = new UserServiceV2(
            repository as any,
            eventPublisher as any,
            logger as any,
            resolver
        );

        await service.syncClerkUser('clerk-1', 'new@example.com', 'New');

        expect(repository.updateUser).toHaveBeenCalledWith(
            'user-1',
            expect.objectContaining({ email: 'new@example.com', name: 'New' })
        );
        expect(eventPublisher.publish).toHaveBeenCalledWith(
            'user.updated',
            expect.objectContaining({ userId: 'user-1', clerkUserId: 'clerk-1' })
        );
    });

    it('creates new user when not found in sync', async () => {
        repository.findUserByClerkId.mockResolvedValue(null);
        repository.createUser.mockResolvedValue({
            id: 'user-1',
            clerk_user_id: 'clerk-1',
            email: 'new@example.com',
            name: 'New',
        });

        const service = new UserServiceV2(
            repository as any,
            eventPublisher as any,
            logger as any,
            resolver
        );

        await service.syncClerkUser('clerk-1', 'new@example.com', 'New');

        expect(repository.createUser).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'uuid-1', clerk_user_id: 'clerk-1' })
        );
        expect(eventPublisher.publish).toHaveBeenCalledWith(
            'user.created',
            expect.objectContaining({ clerkUserId: 'clerk-1' })
        );
    });

    it('registers user when missing', async () => {
        repository.findUserByClerkId.mockResolvedValue(null);
        repository.create.mockResolvedValue({ id: 'user-1', email: 'user@example.com' });

        const service = new UserServiceV2(
            repository as any,
            eventPublisher as any,
            logger as any,
            resolver
        );

        const user = await service.registerUser('clerk-1', { email: 'user@example.com' });

        expect(user.id).toBe('user-1');
        expect(eventPublisher.publish).toHaveBeenCalledWith(
            'user.registered',
            expect.objectContaining({ clerkUserId: 'clerk-1' })
        );
    });

    it('returns existing user on register if already created', async () => {
        repository.findUserByClerkId.mockResolvedValue({ id: 'user-1' });

        const service = new UserServiceV2(
            repository as any,
            eventPublisher as any,
            logger as any,
            resolver
        );

        const user = await service.registerUser('clerk-1', { email: 'user@example.com' });

        expect(user.id).toBe('user-1');
        expect(repository.create).not.toHaveBeenCalled();
    });

    it('enriches user data with access context', async () => {
        repository.findUserByClerkId.mockResolvedValue({ id: 'user-1', clerk_user_id: 'clerk-1' });
        resolver.mockResolvedValue({
            ...accessContext,
            roles: ['platform_admin'],
            isPlatformAdmin: true,
        });

        const service = new UserServiceV2(
            repository as any,
            eventPublisher as any,
            logger as any,
            resolver
        );

        const user = await service.findUserByClerkId('clerk-1');

        expect(user.roles).toEqual(['platform_admin']);
        expect(user.is_platform_admin).toBe(true);
    });
});
