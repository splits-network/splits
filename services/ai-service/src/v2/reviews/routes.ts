/**
 * AI Review Routes - V2
 * REST endpoints for AI-powered candidate reviews
 */

import { FastifyInstance } from 'fastify';
import { AIReviewServiceV2 } from './service';
import { requireUserContext, validateUUID, validateInternalService } from '../shared/helpers';

interface RouteConfig {
    service: AIReviewServiceV2;
}

export function registerAIReviewRoutes(app: FastifyInstance, config: RouteConfig) {
    const { service } = config;

    /**
     * POST /v2/ai-reviews
     * Create new AI review for an application
     */
    app.post<{
        Body: {
            application_id: string;
            candidate_id?: string;
            job_id?: string;
            resume_text?: string;
            job_description?: string;
            job_title?: string;
            required_skills?: string[];
            preferred_skills?: string[];
            required_years?: number;
            candidate_location?: string;
            job_location?: string;
            auto_transition?: boolean;
        };
    }>('/v2/ai-reviews', async (request, reply) => {
        // Check for internal service auth first
        if (!validateInternalService(request)) {
            // If not internal service, require clerk user ID
            const clerkUserId = request.headers['x-clerk-user-id'] as string | undefined;
            if (!requireUserContext(clerkUserId, reply, request)) return;
        }

        try {
            // If minimal data provided, fetch full application details
            const inputData = await service.enrichApplicationData(request.body);
            const review = await service.createReview(inputData);
            return reply.send({ data: review });
        } catch (error: any) {
            request.log.error({ err: error, application_id: request.body.application_id }, 'AI review failed');
            return reply.status(500).send({
                error: {
                    code: 'AI_REVIEW_FAILED',
                    message: error.message || 'Failed to create AI review',
                },
            });
        }
    });

    /**
     * GET /v2/ai-reviews/:id
     * Get AI review by ID
     */
    app.get<{
        Params: { id: string };
    }>('/v2/ai-reviews/:id', async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string | undefined;
        if (!requireUserContext(clerkUserId, reply, request)) return;

        const { id } = request.params;

        if (!validateUUID(id)) {
            return reply.status(400).send({
                error: {
                    code: 'INVALID_ID',
                    message: 'Invalid AI review ID format',
                },
            });
        }

        const review = await service.getReview(id);

        if (!review) {
            return reply.status(404).send({
                error: {
                    code: 'NOT_FOUND',
                    message: 'AI review not found',
                },
            });
        }

        return reply.send({ data: review });
    });

    /**
     * GET /v2/ai-reviews
     * List AI reviews with filters
     */
    app.get<{
        Querystring: {
            application_id?: string;
            job_id?: string;
            fit_score_min?: string;
            fit_score_max?: string;
            recommendation?: string;
            page?: string;
            limit?: string;
        };
    }>('/v2/ai-reviews', async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string | undefined;
        if (!requireUserContext(clerkUserId, reply)) return;

        const filters = {
            application_id: request.query.application_id,
            job_id: request.query.job_id,
            fit_score_min: request.query.fit_score_min ? Number(request.query.fit_score_min) : undefined,
            fit_score_max: request.query.fit_score_max ? Number(request.query.fit_score_max) : undefined,
            recommendation: request.query.recommendation as any,
            page: request.query.page ? Number(request.query.page) : 1,
            limit: request.query.limit ? Number(request.query.limit) : 25,
        };

        const { data, total } = await service.getReviews(filters);

        return reply.send({
            data,
            pagination: {
                total,
                page: filters.page,
                limit: filters.limit,
                total_pages: Math.ceil(total / filters.limit),
            },
        });
    });

    /**
     * GET /v2/ai-reviews/stats/:jobId
     * Get AI review statistics for a job
     */
    app.get<{
        Params: { jobId: string };
    }>('/v2/ai-reviews/stats/:jobId', async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string | undefined;
        if (!requireUserContext(clerkUserId, reply)) return;

        const { jobId } = request.params;

        if (!validateUUID(jobId)) {
            return reply.status(400).send({
                error: {
                    code: 'INVALID_ID',
                    message: 'Invalid job ID format',
                },
            });
        }

        const stats = await service.getReviewStats(jobId);
        return reply.send({ data: stats });
    });
}
