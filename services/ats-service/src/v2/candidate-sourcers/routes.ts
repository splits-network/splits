import { FastifyInstance } from 'fastify';
import { CandidateSourcerServiceV2 } from './service';
import { requireUserContext } from '../helpers';

/**
 * Candidate Sourcers V2 Routes — Read-only + notes update + check-protection
 *
 * Sourcer attribution is immutable — set once at signup via referral link/code.
 * Create and delete routes have been removed to enforce this rule.
 */
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
                    include: { type: 'string' },
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
            include: params.include,
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

    // Update candidate sourcer — notes only
    app.patch('/candidate-sourcers/:id', {
        schema: {
            description: 'Update a candidate sourcer record (notes only — attribution is immutable)',
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
                },
            },
        },
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { id } = request.params as { id: string };
        const body = request.body as any;

        const updated = await service.update(id, clerkUserId, {
            notes: body.notes,
        });

        return reply.send({ data: updated });
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

    // POST and DELETE removed — sourcer attribution is immutable
}
