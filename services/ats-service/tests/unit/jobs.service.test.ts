import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobServiceV2 } from '../../src/v2/jobs/service';
import { AccessContextResolver } from '@splits-network/shared-access-context';

function mockAccessContext(identityUserId = 'user-1') {
    vi.spyOn(AccessContextResolver.prototype, 'resolve').mockResolvedValue({
        identityUserId,
        candidateId: null,
        recruiterId: null,
        organizationIds: [],
        roles: [],
        isPlatformAdmin: false,
        error: '',
    });
}

describe('JobServiceV2 (unit)', () => {
    let repository: any;
    let service: JobServiceV2;
    const supabase = {} as any;
    const eventPublisher = { publish: vi.fn() };

    beforeEach(() => {
        vi.restoreAllMocks();
        repository = {
            findJobs: vi.fn().mockResolvedValue({ data: [], total: 0 }),
            findJob: vi.fn(),
            createJob: vi.fn(),
            updateJob: vi.fn(),
            deleteJob: vi.fn(),
        };
        service = new JobServiceV2(repository, supabase, eventPublisher as any);
    });

    it('validates required fields on create', async () => {
        mockAccessContext();
        await expect(service.createJob({ company_id: 'comp-1' }, 'clerk-1')).rejects.toThrow(
            'Job title is required'
        );
        await expect(service.createJob({ title: 'Engineer' }, 'clerk-1')).rejects.toThrow(
            'Company ID is required'
        );
    });

    it('creates job with owner and default status', async () => {
        mockAccessContext('user-1');
        repository.createJob.mockResolvedValue({ id: 'job-1', status: 'draft', company_id: 'comp-1' });

        const job = await service.createJob({ title: 'Engineer', company_id: 'comp-1' }, 'clerk-1');

        expect(job.id).toBe('job-1');
        expect(repository.createJob).toHaveBeenCalledWith(
            expect.objectContaining({ job_owner_id: 'user-1', status: 'draft' }),
            'clerk-1'
        );
        expect(eventPublisher.publish).toHaveBeenCalledWith('job.created', expect.any(Object));
    });

    it('rejects invalid status transition', async () => {
        mockAccessContext();
        repository.findJob.mockResolvedValue({ id: 'job-1', status: 'draft' });

        await expect(
            service.updateJob('job-1', { status: 'filled' } as any, 'clerk-1')
        ).rejects.toThrow('Invalid status transition: draft -> filled');
    });

    it('validates salary range', async () => {
        mockAccessContext();
        repository.findJob.mockResolvedValue({ id: 'job-1', status: 'active', salary_min: 100, salary_max: 120 });

        await expect(
            service.updateJob('job-1', { salary_min: 130 } as any, 'clerk-1')
        ).rejects.toThrow('salary_min cannot exceed salary_max');
    });
});
