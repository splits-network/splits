import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import { registerAIReviewRoutes } from '../../src/v2/reviews/routes';

describe('AI Review Create Route (integration)', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        process.env.INTERNAL_SERVICE_KEY = 'internal-key';
    });

    afterEach(() => {
        delete process.env.INTERNAL_SERVICE_KEY;
    });

    it('requires auth when internal service key is missing', async () => {
        const app = Fastify();
        const service = {
            enrichApplicationData: vi.fn(),
            createReview: vi.fn(),
        } as any;

        registerAIReviewRoutes(app, { service });

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/ai-reviews',
            payload: { application_id: 'app-1' },
        });

        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.body);
        expect(body.error?.code).toBe('UNAUTHORIZED');
    });

    it('allows request with x-clerk-user-id when internal service key is missing', async () => {
        const app = Fastify();
        const service = {
            enrichApplicationData: vi.fn().mockResolvedValue({ application_id: 'app-1' }),
            createReview: vi.fn().mockResolvedValue({ id: 'review-1' }),
        } as any;

        registerAIReviewRoutes(app, { service });

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/ai-reviews',
            headers: {
                'x-clerk-user-id': 'clerk-user-1',
            },
            payload: { application_id: 'app-1' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data.id).toBe('review-1');
        expect(service.enrichApplicationData).toHaveBeenCalledWith({ application_id: 'app-1' });
    });

    it('returns 500 with error envelope when service throws', async () => {
        const app = Fastify();
        const service = {
            enrichApplicationData: vi.fn().mockResolvedValue({ application_id: 'app-1' }),
            createReview: vi.fn().mockRejectedValue(new Error('boom')),
        } as any;

        registerAIReviewRoutes(app, { service });

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/ai-reviews',
            headers: {
                'x-internal-service-key': 'internal-key',
            },
            payload: { application_id: 'app-1' },
        });

        expect(response.statusCode).toBe(500);
        const body = JSON.parse(response.body);
        expect(body.error?.code).toBe('AI_REVIEW_FAILED');
        expect(body.error?.message).toBe('boom');
    });

    it('accepts internal service key and returns data envelope', async () => {
        const app = Fastify();
        const service = {
            enrichApplicationData: vi.fn().mockResolvedValue({ application_id: 'app-1' }),
            createReview: vi.fn().mockResolvedValue({ id: 'review-2' }),
        } as any;

        registerAIReviewRoutes(app, { service });

        const response = await app.inject({
            method: 'POST',
            url: '/api/v2/ai-reviews',
            headers: {
                'x-internal-service-key': 'internal-key',
            },
            payload: { application_id: 'app-1' },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data.id).toBe('review-2');
    });
});
