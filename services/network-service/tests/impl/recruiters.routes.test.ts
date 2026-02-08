import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';
import { registerRecruiterRoutes } from '../../src/v2/recruiters/routes';

describe('Recruiter routes (integration)', () => {
    const recruiterService = {
        getRecruiterByClerkId: vi.fn(),
        getRecruiters: vi.fn(),
        getRecruiter: vi.fn(),
        createRecruiter: vi.fn(),
        updateRecruiter: vi.fn(),
        deleteRecruiter: vi.fn(),
    };

    it('rejects /me without user context', async () => {
        const app = Fastify();
        registerRecruiterRoutes(app, { recruiterService: recruiterService as any });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/recruiters/me',
        });

        expect(response.statusCode).toBe(404);
        expect(JSON.parse(response.body).error.message).toBe('Missing x-clerk-user-id header');
    });

    it('lists recruiters with optional user context', async () => {
        recruiterService.getRecruiters.mockResolvedValue({ data: [], pagination: { total: 0 } });
        const app = Fastify();
        registerRecruiterRoutes(app, { recruiterService: recruiterService as any });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/recruiters?filters=%7B%22status%22%3A%22active%22%7D&page=2&limit=10',
        });

        expect(response.statusCode).toBe(200);
        expect(recruiterService.getRecruiters).toHaveBeenCalledWith(
            undefined,
            expect.objectContaining({
                page: '2',
                limit: '10',
                status: 'active',
                filters: { status: 'active' },
            })
        );
    });

    it('creates recruiter with user context', async () => {
        recruiterService.createRecruiter.mockResolvedValue({ id: 'rec-1' });
        const app = Fastify();
        registerRecruiterRoutes(app, { recruiterService: recruiterService as any });

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/recruiters',
            headers: {
                'x-clerk-user-id': 'clerk-1',
                'content-type': 'application/json',
            },
            payload: { user_id: 'user-1' },
        });

        expect(response.statusCode).toBe(201);
        expect(recruiterService.createRecruiter).toHaveBeenCalledWith(
            { user_id: 'user-1' },
            'clerk-1'
        );
    });

    it('updates recruiter with user context', async () => {
        recruiterService.updateRecruiter.mockResolvedValue({ id: 'rec-1' });
        const app = Fastify();
        registerRecruiterRoutes(app, { recruiterService: recruiterService as any });

        const response = await app.inject({
            method: 'PATCH',
            url: '/api/v2/recruiters/rec-1',
            headers: {
                'x-clerk-user-id': 'clerk-1',
                'content-type': 'application/json',
            },
            payload: { phone: '123' },
        });

        expect(response.statusCode).toBe(200);
        expect(recruiterService.updateRecruiter).toHaveBeenCalledWith(
            'rec-1',
            { phone: '123' },
            'clerk-1'
        );
    });
});
