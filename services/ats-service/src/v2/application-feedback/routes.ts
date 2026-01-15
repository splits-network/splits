/**
 * Application Feedback Routes - V2
 * HTTP endpoints for application feedback management
 */

import { FastifyInstance } from 'fastify';
import { ApplicationFeedbackServiceV2 } from './service';
import { ApplicationFeedbackFilters, ApplicationFeedbackCreate, ApplicationFeedbackUpdate } from './types';
import { requireUserContext } from '../helpers';

export async function registerApplicationFeedbackRoutes(
    app: FastifyInstance,
    service: ApplicationFeedbackServiceV2
) {
    /**
     * GET /api/v2/applications/:application_id/feedback
     * List feedback for an application (threaded conversation)
     */
    app.get<{
        Params: { application_id: string };
        Querystring: {
            page?: number;
            limit?: number;
            feedback_type?: string;
            in_response_to_id?: string;
        };
    }>('/applications/:application_id/feedback', async (request, reply) => {
        const context = requireUserContext(request);
        const { application_id } = request.params;
        const { page = 1, limit = 50, feedback_type, in_response_to_id } = request.query;

        const filters: ApplicationFeedbackFilters = {
            application_id,
            page: Number(page),
            limit: Number(limit),
        };

        if (feedback_type) {
            filters.feedback_type = feedback_type as any;
        }

        if (in_response_to_id) {
            filters.in_response_to_id = in_response_to_id;
        }

        const result = await service.list(context.clerkUserId, filters);
        return reply.send({ data: result.data, pagination: result.pagination });
    });

    /**
     * GET /api/v2/application-feedback/:id
     * Get single feedback by ID
     */
    app.get<{
        Params: { id: string };
    }>('/application-feedback/:id', async (request, reply) => {
        const context = requireUserContext(request);
        const { id } = request.params;

        const feedback = await service.getById(id, context.clerkUserId);

        if (!feedback) {
            return reply.code(404).send({
                error: {
                    code: 'FEEDBACK_NOT_FOUND',
                    message: 'Feedback not found or access denied',
                },
            });
        }

        return reply.send({ data: feedback });
    });

    /**
     * POST /api/v2/applications/:application_id/feedback
     * Create new feedback
     */
    app.post<{
        Params: { application_id: string };
        Body: ApplicationFeedbackCreate;
    }>('/applications/:application_id/feedback', async (request, reply) => {
        const context = requireUserContext(request);
        const { application_id } = request.params;

        // Merge application_id from route params
        const data = {
            ...request.body,
            application_id,
        };

        try {
            const feedback = await service.create(context.clerkUserId, data);
            return reply.code(201).send({ data: feedback });
        } catch (error: any) {
            if (error.message.includes('required') || error.message.includes('too long')) {
                return reply.code(400).send({
                    error: {
                        code: 'INVALID_INPUT',
                        message: error.message,
                    },
                });
            }
            throw error;
        }
    });

    /**
     * PATCH /api/v2/application-feedback/:id
     * Update feedback (message text only)
     */
    app.patch<{
        Params: { id: string };
        Body: ApplicationFeedbackUpdate;
    }>('/application-feedback/:id', async (request, reply) => {
        const context = requireUserContext(request);
        const { id } = request.params;

        try {
            const feedback = await service.update(id, context.clerkUserId, request.body);
            return reply.send({ data: feedback });
        } catch (error: any) {
            if (error.message.includes('not found') || error.message.includes('access denied')) {
                return reply.code(404).send({
                    error: {
                        code: 'FEEDBACK_NOT_FOUND',
                        message: error.message,
                    },
                });
            }
            if (error.message.includes('cannot be empty') || error.message.includes('too long')) {
                return reply.code(400).send({
                    error: {
                        code: 'INVALID_INPUT',
                        message: error.message,
                    },
                });
            }
            throw error;
        }
    });

    /**
     * DELETE /api/v2/application-feedback/:id
     * Delete feedback (soft delete)
     */
    app.delete<{
        Params: { id: string };
    }>('/application-feedback/:id', async (request, reply) => {
        const context = requireUserContext(request);
        const { id } = request.params;

        try {
            await service.delete(id, context.clerkUserId);
            return reply.send({ data: { message: 'Feedback deleted successfully' } });
        } catch (error: any) {
            if (error.message.includes('not found') || error.message.includes('access denied')) {
                return reply.code(404).send({
                    error: {
                        code: 'FEEDBACK_NOT_FOUND',
                        message: error.message,
                    },
                });
            }
            throw error;
        }
    });
}
