import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecruiterServiceV2 } from '../../src/v2/recruiters/service';

describe('RecruiterServiceV2 (unit)', () => {
    const repository = {
        findRecruiters: vi.fn(),
        findRecruiter: vi.fn(),
        findByClerkUserId: vi.fn(),
        findRecruiterByUserId: vi.fn(),
        createRecruiter: vi.fn(),
        createRecruiterUserRole: vi.fn(),
        updateRecruiter: vi.fn(),
        deleteRecruiter: vi.fn(),
    };
    const eventPublisher = { publish: vi.fn() };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('throws when recruiter not found', async () => {
        repository.findRecruiter.mockResolvedValue(null);
        const service = new RecruiterServiceV2(repository as any, eventPublisher as any);

        await expect(service.getRecruiter('rec-1', undefined)).rejects.toMatchObject({
            statusCode: 404,
        });
    });

    it('throws when recruiter profile not found by clerk id', async () => {
        repository.findByClerkUserId.mockResolvedValue(null);
        const service = new RecruiterServiceV2(repository as any, eventPublisher as any);

        await expect(service.getRecruiterByClerkId('clerk-1')).rejects.toMatchObject({
            statusCode: 404,
        });
    });

    it('prevents creating duplicate recruiter profile', async () => {
        repository.findRecruiterByUserId.mockResolvedValue({ id: 'rec-1' });
        const service = new RecruiterServiceV2(repository as any, eventPublisher as any);

        await expect(service.createRecruiter({ user_id: 'user-1' }, 'clerk-1')).rejects.toMatchObject({
            statusCode: 409,
        });
    });

    it('creates recruiter and publishes event', async () => {
        repository.findRecruiterByUserId.mockResolvedValue(null);
        repository.createRecruiter.mockResolvedValue({
            id: 'rec-1',
            user_id: 'user-1',
            status: 'active',
        });
        const service = new RecruiterServiceV2(repository as any, eventPublisher as any);

        const recruiter = await service.createRecruiter({ user_id: 'user-1' }, 'clerk-1');

        expect(recruiter.id).toBe('rec-1');
        expect(repository.createRecruiter).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'active' })
        );
        expect(eventPublisher.publish).toHaveBeenCalledWith('recruiter.created', {
            recruiterId: 'rec-1',
            userId: 'user-1',
            status: 'active',
        });
    });

    it('rejects invalid email updates', async () => {
        const service = new RecruiterServiceV2(repository as any, eventPublisher as any);

        await expect(service.updateRecruiter('rec-1', { email: 'bad' } as any, 'clerk-1'))
            .rejects.toMatchObject({ statusCode: 400 });
    });

    it('rejects empty name updates', async () => {
        const service = new RecruiterServiceV2(repository as any, eventPublisher as any);

        await expect(service.updateRecruiter('rec-1', { name: '   ' } as any, 'clerk-1'))
            .rejects.toMatchObject({ statusCode: 400 });
    });

    it('rejects invalid status transitions', async () => {
        repository.findRecruiter.mockResolvedValue({ status: 'pending' });
        const service = new RecruiterServiceV2(repository as any, eventPublisher as any);

        await expect(service.updateRecruiter('rec-1', { status: 'inactive' } as any, 'clerk-1'))
            .rejects.toMatchObject({ statusCode: 400 });
    });

    it('publishes update event', async () => {
        repository.findRecruiter.mockResolvedValue({ status: 'active' });
        repository.updateRecruiter.mockResolvedValue({ id: 'rec-1' });
        const service = new RecruiterServiceV2(repository as any, eventPublisher as any);

        await service.updateRecruiter('rec-1', { phone: '123' } as any, 'clerk-1');

        expect(eventPublisher.publish).toHaveBeenCalledWith('recruiter.updated', {
            recruiterId: 'rec-1',
            updates: ['phone'],
        });
    });
});
