import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import { registerApplicationRoutes } from '../../src/v2/applications/routes';

describe('Application routes (integration)', () => {
    let service: any;

    beforeEach(() => {
        vi.restoreAllMocks();
        service = {
            getApplications: vi.fn().mockResolvedValue({ data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 } }),
            getApplication: vi.fn().mockResolvedValue({ id: 'app-1' }),
            createApplication: vi.fn().mockResolvedValue({ id: 'app-1' }),
            updateApplication: vi.fn().mockResolvedValue({ id: 'app-1' }),
            deleteApplication: vi.fn().mockResolvedValue(undefined),
            triggerAIReview: vi.fn().mockResolvedValue(undefined),
            returnToDraft: vi.fn().mockResolvedValue({ id: 'app-1', stage: 'draft' }),
            submitApplication: vi.fn().mockResolvedValue({ application: { id: 'app-1' } }),
            proposeJobToCandidate: vi.fn().mockResolvedValue({ id: 'app-2' }),
            acceptProposal: vi.fn().mockResolvedValue({ id: 'app-3' }),
            declineProposal: vi.fn().mockResolvedValue({ id: 'app-4' }),
        };
    });

    it('rejects list without user context', async () => {
        const app = Fastify();
        registerApplicationRoutes(app, { applicationService: service });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/applications',
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).error.message).toBe('Missing x-clerk-user-id header');
    });

    it('creates application with clerk user id', async () => {
        const app = Fastify();
        registerApplicationRoutes(app, { applicationService: service });

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/applications',
            headers: { 'x-clerk-user-id': 'clerk-1' },
            payload: { job_id: 'job-1' },
        });

        expect(response.statusCode).toBe(201);
        expect(JSON.parse(response.body).data.id).toBe('app-1');
    });

    it('returns application with include parsing', async () => {
        const app = Fastify();
        registerApplicationRoutes(app, { applicationService: service });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/applications/app-1?include=documents,ai_review',
            headers: { 'x-clerk-user-id': 'clerk-1' },
        });

        expect(response.statusCode).toBe(200);
        expect(service.getApplication).toHaveBeenCalledWith('app-1', 'clerk-1', ['documents', 'ai_review']);
    });

    it('submits application via endpoint', async () => {
        const app = Fastify();
        registerApplicationRoutes(app, { applicationService: service });

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/applications/app-1/submit',
            headers: { 'x-clerk-user-id': 'clerk-1' },
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body).data.application.id).toBe('app-1');
    });
});
