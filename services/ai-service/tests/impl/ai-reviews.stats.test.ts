import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import { registerAIReviewRoutes } from '../../src/v2/reviews/routes';

describe('AI Review Stats Route (integration)', () => {
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
            getReviewStats: vi.fn(),
        } as any;

        registerAIReviewRoutes(app, { service });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/ai-reviews/stats/9f3b3b6a-5d4b-4d7a-8a5e-2b4d2a4f7b1d',
        });

        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.body);
        expect(body.error?.code).toBe('UNAUTHORIZED');
    });

    it('validates UUID format', async () => {
        const app = Fastify();
        const service = {
            getReviewStats: vi.fn(),
        } as any;

        registerAIReviewRoutes(app, { service });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/ai-reviews/stats/not-a-uuid',
            headers: {
                'x-clerk-user-id': 'clerk-user-1',
            },
        });

        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.error?.code).toBe('INVALID_ID');
    });

    it('returns stats data envelope when authorized', async () => {
        const app = Fastify();
        const service = {
            getReviewStats: vi.fn().mockResolvedValue({
                total_applications: 2,
                ai_reviewed_count: 2,
                average_fit_score: 78,
                recommendation_breakdown: {
                    strong_fit: 1,
                    good_fit: 1,
                    fair_fit: 0,
                    poor_fit: 0,
                },
                most_matched_skills: ['TypeScript'],
                most_missing_skills: ['GraphQL'],
            }),
        } as any;

        registerAIReviewRoutes(app, { service });

        const response = await app.inject({
            method: 'GET',
            url: '/api/v2/ai-reviews/stats/9f3b3b6a-5d4b-4d7a-8a5e-2b4d2a4f7b1d',
            headers: {
                'x-clerk-user-id': 'clerk-user-1',
            },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data.average_fit_score).toBe(78);
        expect(body.data.most_matched_skills).toEqual(['TypeScript']);
    });
});
