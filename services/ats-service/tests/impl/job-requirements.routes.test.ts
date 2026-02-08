import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import { registerJobRequirementRoutes } from '../../src/v2/job-requirements/routes';

describe('Job requirements routes (integration)', () => {
    let service: any;

    beforeEach(() => {
        vi.restoreAllMocks();
        service = {
            listRequirements: vi.fn().mockResolvedValue([]),
            getRequirement: vi.fn().mockResolvedValue({ id: 'req-1' }),
            createRequirement: vi.fn().mockResolvedValue({ id: 'req-1' }),
            updateRequirement: vi.fn().mockResolvedValue({ id: 'req-1' }),
            deleteRequirement: vi.fn().mockResolvedValue(undefined),
        };
    });

    it('rejects list without user context', async () => {
        const app = Fastify();
        registerJobRequirementRoutes(app, { service });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/job-requirements',
        });

        expect(response.statusCode).toBe(400);
    });

    it('creates requirement with auth', async () => {
        const app = Fastify();
        registerJobRequirementRoutes(app, { service });

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/job-requirements',
            headers: { 'x-clerk-user-id': 'clerk-1' },
            payload: { job_id: 'job-1', requirement_text: 'Must have X' },
        });

        expect(response.statusCode).toBe(201);
        expect(JSON.parse(response.body).data.id).toBe('req-1');
    });
});
