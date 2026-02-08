import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import { registerAIReviewRoutes } from '../../src/v2/reviews/routes';

describe('AI Review List Route (integration)', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        process.env.INTERNAL_SERVICE_KEY = 'internal-key';
    });

    afterEach(() => {
        delete process.env.INTERNAL_SERVICE_KEY;
    });

    it('rejects when x-clerk-user-id is missing', async () => {
        const app = Fastify();
        const service = {
            getReviews: vi.fn(),
        } as any;

        registerAIReviewRoutes(app, { service });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/ai-reviews',
        });

        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.body);
        expect(body.error?.code).toBe('UNAUTHORIZED');
    });

    it('parses filters from query string and returns pagination envelope', async () => {
        const app = Fastify();
        const service = {
            getReviews: vi.fn().mockResolvedValue({
                data: [{ id: 'review-1' }],
                total: 1,
            }),
        } as any;

        registerAIReviewRoutes(app, { service });

        const filters = encodeURIComponent(JSON.stringify({ recommendation: 'good_fit' }));
        const response = await app.inject({
            method: 'GET',
            url: `/api/v2/ai-reviews?application_id=app-1&fit_score_min=60&fit_score_max=90&page=2&limit=10&filters=${filters}`,
            headers: {
                'x-clerk-user-id': 'clerk-user-1',
            },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data).toHaveLength(1);
        expect(body.pagination).toEqual({
            total: 1,
            page: 2,
            limit: 10,
            total_pages: 1,
        });
        expect(service.getReviews).toHaveBeenCalledWith({
            application_id: 'app-1',
            job_id: undefined,
            fit_score_min: 60,
            fit_score_max: 90,
            recommendation: 'good_fit',
            page: 2,
            limit: 10,
        });
    });
});
