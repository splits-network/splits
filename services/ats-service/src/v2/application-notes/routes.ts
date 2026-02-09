/**
 * Application Notes Routes - V2
 * HTTP endpoints for application notes management
 */

import { FastifyInstance } from 'fastify';
import { ApplicationNoteServiceV2 } from './service';
import { ApplicationNoteFilters, ApplicationNoteCreate, ApplicationNoteUpdate } from './types';
import { requireUserContext } from '../helpers';

export async function registerApplicationNoteRoutes(
    app: FastifyInstance,
    service: ApplicationNoteServiceV2
) {
    /**
     * GET /api/v2/applications/:application_id/notes
     * List notes for an application (chronological order)
     */
    app.get<{
        Params: { application_id: string };
        Querystring: {
            page?: number;
            limit?: number;
            note_type?: string;
            visibility?: string;
            in_response_to_id?: string;
        };
    }>('/api/v2/applications/:application_id/notes', async (request, reply) => {
        const context = requireUserContext(request);
        const { application_id } = request.params;
        const { page = 1, limit = 50, note_type, visibility, in_response_to_id } = request.query;

        const filters: ApplicationNoteFilters = {
            application_id,
            page: Number(page),
            limit: Number(limit),
        };

        if (note_type) {
            filters.note_type = note_type as any;
        }

        if (visibility) {
            filters.visibility = visibility as any;
        }

        if (in_response_to_id) {
            filters.in_response_to_id = in_response_to_id;
        }

        const result = await service.list(context.clerkUserId, filters);
        return reply.send({ data: result.data, pagination: result.pagination });
    });

    /**
     * GET /api/v2/application-notes/:id
     * Get single note by ID
     */
    app.get<{
        Params: { id: string };
    }>('/api/v2/application-notes/:id', async (request, reply) => {
        const context = requireUserContext(request);
        const { id } = request.params;

        const note = await service.getById(id, context.clerkUserId);

        if (!note) {
            return reply.code(404).send({
                error: {
                    code: 'NOTE_NOT_FOUND',
                    message: 'Note not found or access denied',
                },
            });
        }

        return reply.send({ data: note });
    });

    /**
     * POST /api/v2/applications/:application_id/notes
     * Create new note
     */
    app.post<{
        Params: { application_id: string };
        Body: Omit<ApplicationNoteCreate, 'application_id'>;
    }>('/api/v2/applications/:application_id/notes', async (request, reply) => {
        const context = requireUserContext(request);
        const { application_id } = request.params;

        // Merge application_id from route params
        const data: ApplicationNoteCreate = {
            ...request.body,
            application_id,
        };

        try {
            const note = await service.create(context.clerkUserId, data);
            return reply.code(201).send({ data: note });
        } catch (error: any) {
            if (error.message.includes('required') || error.message.includes('too long') || error.message.includes('Invalid')) {
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
     * PATCH /api/v2/application-notes/:id
     * Update note (message text and visibility)
     */
    app.patch<{
        Params: { id: string };
        Body: ApplicationNoteUpdate;
    }>('/api/v2/application-notes/:id', async (request, reply) => {
        const context = requireUserContext(request);
        const { id } = request.params;

        try {
            const note = await service.update(id, context.clerkUserId, request.body);
            return reply.send({ data: note });
        } catch (error: any) {
            if (error.message.includes('not found') || error.message.includes('access denied')) {
                return reply.code(404).send({
                    error: {
                        code: 'NOTE_NOT_FOUND',
                        message: error.message,
                    },
                });
            }
            if (error.message.includes('cannot be empty') || error.message.includes('too long') || error.message.includes('Invalid')) {
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
     * DELETE /api/v2/application-notes/:id
     * Delete note
     */
    app.delete<{
        Params: { id: string };
    }>('/api/v2/application-notes/:id', async (request, reply) => {
        const context = requireUserContext(request);
        const { id } = request.params;

        try {
            await service.delete(id, context.clerkUserId);
            return reply.send({ data: { message: 'Note deleted successfully' } });
        } catch (error: any) {
            if (error.message.includes('not found') || error.message.includes('access denied')) {
                return reply.code(404).send({
                    error: {
                        code: 'NOTE_NOT_FOUND',
                        message: error.message,
                    },
                });
            }
            throw error;
        }
    });
}
