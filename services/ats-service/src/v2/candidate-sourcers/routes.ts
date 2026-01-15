import { FastifyInstance } from 'fastify';
import { CandidateSourcerServiceV2 } from './service';
import { requireUserContext } from '../helpers';

export async function candidateSourcerRoutes(app: FastifyInstance, service: CandidateSourcerServiceV2) {
    // List candidate sourcers
    app.get('/candidate-sourcers', {
        schema: {
            description: 'List candidate sourcer records',
            tags: ['candidate-sourcers'],
            querystring: {
                type: 'object',
                properties: {
                    page: { type: 'number', minimum: 1, default: 1 },
                    limit: { type: 'number', minimum: 1, maximum: 100, default: 25 },
                    search: { type: 'string' },
                    candidate_id: { type: 'string', format: 'uuid' },
                    sourcer_user_id: { type: 'string', format: 'uuid' },
                    sourcer_type: { type: 'string', enum: ['recruiter', 'tsn'] },
                    active_protection: { type: 'boolean' },
                    sort_by: { type: 'string', default: 'sourced_at' },
                    sort_order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        data: { type: 'array' },
                        pagination: {
                            type: 'object',
                            properties: {
                                total: { type: 'number' },
                                page: { type: 'number' },
                                limit: { type: 'number' },
                                total_pages: { type: 'number' },
                            },
                        },
                    },
                },
            },
        },
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const params = request.query as any;

        const result = await service.list(clerkUserId, {
            page: params.page,
            limit: params.limit,
            search: params.search,
            filters: {
                candidate_id: params.candidate_id,
                sourcer_user_id: params.sourcer_user_id,
                sourcer_type: params.sourcer_type,
                active_protection: params.active_protection,
            },
            sort_by: params.sort_by,
            sort_order: params.sort_order,
        });

        return reply.send({ data: result.data, pagination: result.pagination });
    });

    // Get single candidate sourcer
    app.get('/candidate-sourcers/:id', {
        schema: {
            description: 'Get a candidate sourcer record by ID',
            tags: ['candidate-sourcers'],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
        },
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { id } = request.params as { id: string };

        const sourcer = await service.get(id, clerkUserId);
        return reply.send({ data: sourcer });
    });

    // Create candidate sourcer
    app.post('/candidate-sourcers', {
        schema: {
            description: 'Create a new candidate sourcer record',
            tags: ['candidate-sourcers'],
            body: {
                type: 'object',
                required: ['candidate_id', 'sourcer_user_id', 'sourcer_type', 'protection_expires_at'],
                properties: {
                    candidate_id: { type: 'string', format: 'uuid' },
                    sourcer_user_id: { type: 'string', format: 'uuid' },
                    sourcer_type: { type: 'string', enum: ['recruiter', 'tsn'] },
                    sourced_at: { type: 'string', format: 'date-time' },
                    protection_window_days: { type: 'number', minimum: 1, default: 365 },
                    protection_expires_at: { type: 'string', format: 'date-time' },
                    notes: { type: 'string' },
                },
            },
        },
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const body = request.body as any;

        const sourcer = await service.create(clerkUserId, {
            candidate_id: body.candidate_id,
            sourcer_user_id: body.sourcer_user_id,
            sourcer_type: body.sourcer_type,
            sourced_at: body.sourced_at ? new Date(body.sourced_at) : undefined,
            protection_window_days: body.protection_window_days,
            protection_expires_at: new Date(body.protection_expires_at),
            notes: body.notes,
        });

        return reply.code(201).send({ data: sourcer });
    });

    // Update candidate sourcer
    app.patch('/candidate-sourcers/:id', {
        schema: {
            description: 'Update a candidate sourcer record',
            tags: ['candidate-sourcers'],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
            body: {
                type: 'object',
                properties: {
                    notes: { type: 'string' },
                    protection_window_days: { type: 'number', minimum: 1 },
                    protection_expires_at: { type: 'string', format: 'date-time' },
                },
            },
        },
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { id } = request.params as { id: string };
        const body = request.body as any;

        const updated = await service.update(id, clerkUserId, {
            notes: body.notes,
            protection_window_days: body.protection_window_days,
            protection_expires_at: body.protection_expires_at ? new Date(body.protection_expires_at) : undefined,
        });

        return reply.send({ data: updated });
    });

    // Delete candidate sourcer
    app.delete('/candidate-sourcers/:id', {
        schema: {
            description: 'Delete a candidate sourcer record (admin only)',
            tags: ['candidate-sourcers'],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
        },
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { id } = request.params as { id: string };

        await service.delete(id, clerkUserId);
        return reply.send({ data: { message: 'Candidate sourcer deleted successfully' } });
    });

    // Check protection status
    app.get('/candidate-sourcers/check-protection/:candidate_id', {
        schema: {
            description: 'Check if a candidate has active sourcer protection',
            tags: ['candidate-sourcers'],
            params: {
                type: 'object',
                required: ['candidate_id'],
                properties: {
                    candidate_id: { type: 'string', format: 'uuid' },
                },
            },
        },
    }, async (request, reply) => {
        const { candidate_id } = request.params as { candidate_id: string };

        const protection = await service.checkProtection(candidate_id);
        return reply.send({ data: protection });
    });
}
