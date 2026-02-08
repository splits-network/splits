import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AssignmentServiceV2 } from '../../src/v2/assignments/service';

describe('AssignmentServiceV2 (unit)', () => {
    const repository = {
        findAssignments: vi.fn(),
        findAssignment: vi.fn(),
        createAssignment: vi.fn(),
        updateAssignment: vi.fn(),
        deleteAssignment: vi.fn(),
    };
    const eventPublisher = { publish: vi.fn() };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('rejects create without recruiter/job ids', async () => {
        const service = new AssignmentServiceV2(repository as any, eventPublisher as any);

        await expect(service.createAssignment({ recruiter_id: '', job_id: '' }, 'clerk-1'))
            .rejects.toMatchObject({ statusCode: 400 });
    });

    it('creates assignment and publishes event', async () => {
        repository.createAssignment.mockResolvedValue({
            id: 'assign-1',
            recruiter_id: 'rec-1',
            job_id: 'job-1',
        });
        const service = new AssignmentServiceV2(repository as any, eventPublisher as any);

        const assignment = await service.createAssignment(
            { recruiter_id: 'rec-1', job_id: 'job-1' },
            'clerk-1'
        );

        expect(assignment.id).toBe('assign-1');
        expect(eventPublisher.publish).toHaveBeenCalledWith('assignment.created', {
            assignmentId: 'assign-1',
            recruiterId: 'rec-1',
            jobId: 'job-1',
        });
    });

    it('rejects invalid status transition', async () => {
        repository.findAssignment.mockResolvedValue({ status: 'active' });
        const service = new AssignmentServiceV2(repository as any, eventPublisher as any);

        await expect(service.updateAssignment('assign-1', { status: 'pending' } as any, 'clerk-1'))
            .rejects.toMatchObject({ statusCode: 400 });
    });

    it('throws when assignment missing for status update', async () => {
        repository.findAssignment.mockResolvedValue(null);
        const service = new AssignmentServiceV2(repository as any, eventPublisher as any);

        await expect(service.updateAssignment('assign-1', { status: 'inactive' } as any, 'clerk-1'))
            .rejects.toMatchObject({ statusCode: 404 });
    });

    it('publishes update event', async () => {
        repository.findAssignment.mockResolvedValue({ status: 'active' });
        repository.updateAssignment.mockResolvedValue({ id: 'assign-1' });
        const service = new AssignmentServiceV2(repository as any, eventPublisher as any);

        await service.updateAssignment('assign-1', { status: 'inactive' } as any, 'clerk-1');

        expect(eventPublisher.publish).toHaveBeenCalledWith('assignment.updated', {
            assignmentId: 'assign-1',
            updates: ['status'],
        });
    });
});
