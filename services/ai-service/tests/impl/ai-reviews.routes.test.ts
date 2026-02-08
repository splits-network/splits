import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import { registerAIReviewRoutes } from '../../src/v2/reviews/routes';

describe('AI Review Routes (integration)', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        process.env.INTERNAL_SERVICE_KEY = 'internal-key';
    });

    afterEach(() => {
        delete process.env.INTERNAL_SERVICE_KEY;
    });

    it('allows POST with internal service key and returns data envelope', async () => {
        const app = Fastify();

        const service = {
            enrichApplicationData: vi.fn().mockResolvedValue({
                application_id: 'app-1',
                job_title: 'Engineer',
                job_description: 'Build things',
                required_skills: ['TypeScript'],
            }),
            createReview: vi.fn().mockResolvedValue({ id: 'review-1', fit_score: 85 }),
        } as any;

        registerAIReviewRoutes(app, { service });

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/ai-reviews',
            headers: {
                'x-internal-service-key': 'internal-key',
            },
            payload: {
                application_id: 'app-1',
            },
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({ data: { id: 'review-1', fit_score: 85 } });
        expect(service.enrichApplicationData).toHaveBeenCalledWith({ application_id: 'app-1' });
        expect(service.createReview).toHaveBeenCalled();
    });

    it('rejects GET by id when x-clerk-user-id is missing', async () => {
        const app = Fastify();
        const service = {
            getReview: vi.fn(),
        } as any;

        registerAIReviewRoutes(app, { service });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/ai-reviews/9f3b3b6a-5d4b-4d7a-8a5e-2b4d2a4f7b1d',
        });

        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.body);
        expect(body.error?.code).toBe('UNAUTHORIZED');
    });

    it('validates UUID format on GET by id', async () => {
        const app = Fastify();
        const service = {
            getReview: vi.fn(),
        } as any;

        registerAIReviewRoutes(app, { service });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/ai-reviews/not-a-uuid',
            headers: {
                'x-clerk-user-id': 'clerk-user-1',
            },
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.error?.code).toBe('INVALID_ID');
    });
});
