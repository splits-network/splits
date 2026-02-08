import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import { registerJobRoutes } from '../../src/v2/jobs/routes';

describe('Job routes (integration)', () => {
    let service: any;

    beforeEach(() => {
        vi.restoreAllMocks();
        service = {
            getJobs: vi.fn().mockResolvedValue({ data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 } }),
            getJob: vi.fn().mockResolvedValue({ id: 'job-1' }),
            createJob: vi.fn().mockResolvedValue({ id: 'job-1' }),
            updateJob: vi.fn().mockResolvedValue({ id: 'job-1' }),
            deleteJob: vi.fn().mockResolvedValue(undefined),
        };
    });

    it('lists jobs without auth (public)', async () => {
        const app = Fastify();
        registerJobRoutes(app, { jobService: service });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/jobs',
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body).pagination.page).toBe(1);
    });

    it('creates job requires auth', async () => {
        const app = Fastify();
        registerJobRoutes(app, { jobService: service });

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/jobs',
            payload: { title: 'Engineer', company_id: 'comp-1' },
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error.message).toBe('Missing x-clerk-user-id header');
    });

    it('gets job with include parsing', async () => {
        const app = Fastify();
        registerJobRoutes(app, { jobService: service });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/jobs/job-1?include=company,applications',
        });

        expect(response.statusCode).toBe(200);
        expect(service.getJob).toHaveBeenCalledWith('job-1', undefined, ['company', 'applications']);
    });
});
