import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';
import { registerAssignmentRoutes } from '../../src/v2/assignments/routes';

describe('Assignment routes (integration)', () => {
    const assignmentService = {
        getAssignments: vi.fn(),
        getAssignment: vi.fn(),
        createAssignment: vi.fn(),
        updateAssignment: vi.fn(),
        deleteAssignment: vi.fn(),
    };

    it('rejects list without user context', async () => {
        const app = Fastify();
        registerAssignmentRoutes(app, { assignmentService: assignmentService as any });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/assignments',
        });

        expect(response.statusCode).toBe(500);
        expect(JSON.parse(response.body).error).toBe('Missing x-clerk-user-id header');
    });

    it('lists assignments with filters', async () => {
        assignmentService.getAssignments.mockResolvedValue({ data: [], pagination: { total: 0 } });
        const app = Fastify();
        registerAssignmentRoutes(app, { assignmentService: assignmentService as any });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/assignments?filters=%7B%22status%22%3A%22active%22%7D&limit=5',
            headers: { 'x-clerk-user-id': 'clerk-1' },
        });

        expect(response.statusCode).toBe(200);
        expect(assignmentService.getAssignments).toHaveBeenCalledWith(
            'clerk-1',
            expect.objectContaining({
                limit: '5',
                filters: { status: 'active' },
            })
        );
    });

    it('creates assignment with user context', async () => {
        assignmentService.createAssignment.mockResolvedValue({ id: 'assign-1' });
        const app = Fastify();
        registerAssignmentRoutes(app, { assignmentService: assignmentService as any });

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/assignments',
            headers: {
                'x-clerk-user-id': 'clerk-1',
                'content-type': 'application/json',
            },
            payload: { recruiter_id: 'rec-1', job_id: 'job-1' },
        });

        expect(response.statusCode).toBe(201);
        expect(assignmentService.createAssignment).toHaveBeenCalledWith(
            { recruiter_id: 'rec-1', job_id: 'job-1' },
            'clerk-1'
        );
    });
});
