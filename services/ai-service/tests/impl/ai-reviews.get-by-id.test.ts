import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import { registerAIReviewRoutes } from '../../src/v2/reviews/routes';

describe('AI Review Get By Id Route (integration)', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        process.env.INTERNAL_SERVICE_KEY = 'internal-key';
    });

    afterEach(() => {
        delete process.env.INTERNAL_SERVICE_KEY;
    });

    it('returns 404 when review is not found', async () => {
        const app = Fastify();
        const service = {
            getReview: vi.fn().mockResolvedValue(null),
        } as any;

        registerAIReviewRoutes(app, { service });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/ai-reviews/9f3b3b6a-5d4b-4d7a-8a5e-2b4d2a4f7b1d',
            headers: {
                'x-clerk-user-id': 'clerk-user-1',
            },
        });

        expect(response.statusCode).toBe(404);
        const body = JSON.parse(response.body);
        expect(body.error?.code).toBe('NOT_FOUND');
    });
});
