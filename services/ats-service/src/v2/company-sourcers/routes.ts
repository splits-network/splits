import { FastifyInstance } from 'fastify';
import { CompanySourcerServiceV2 } from './service.js';
import { requireUserContext } from '../helpers.js';

/**
 * Company Sourcers V2 Routes — Read-only + notes update + check-protection
 *
 * Sourcer attribution is immutable — set once at onboarding via referral link/code.
 * Create and delete routes have been removed to enforce this rule.
 */
export async function companySourcerRoutes(app: FastifyInstance, service: CompanySourcerServiceV2) {
    // List company sourcers
    app.get('/company-sourcers', {
        schema: {
            description: 'List company sourcer records',
            tags: ['company-sourcers'],
            querystring: {
                type: 'object',
                properties: {
                    page: { type: 'number', minimum: 1, default: 1 },
                    limit: { type: 'number', minimum: 1, maximum: 100, default: 25 },
                    search: { type: 'string' },
                    company_id: { type: 'string', format: 'uuid' },
                    recruiter_id: { type: 'string', format: 'uuid' },
                    status: { type: 'string', enum: ['pending', 'active', 'declined', 'terminated'] },
                    sort_by: { type: 'string', default: 'relationship_start_date' },
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
                company_id: params.company_id,
                recruiter_id: params.recruiter_id,
                status: params.status,
            },
            sort_by: params.sort_by,
            sort_order: params.sort_order,
        });

        return reply.send({ data: result.data, pagination: result.pagination });
    });

    // Get single company sourcer
    app.get('/company-sourcers/:id', {
        schema: {
            description: 'Get a company sourcer record by ID',
            tags: ['company-sourcers'],
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

    // Update company sourcer — notes only
    app.patch('/company-sourcers/:id', {
        schema: {
            description: 'Update a company sourcer record (notes only — attribution is immutable)',
            tags: ['company-sourcers'],
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
    app.get('/company-sourcers/check-protection/:company_id', {
        schema: {
            description: 'Check if a company has active sourcer protection',
            tags: ['company-sourcers'],
            params: {
                type: 'object',
                required: ['company_id'],
                properties: {
                    company_id: { type: 'string', format: 'uuid' },
                },
            },
        },
    }, async (request, reply) => {
        const { company_id } = request.params as { company_id: string };

        const protection = await service.checkProtection(company_id);
        return reply.send({ data: protection });
    });

    // POST and DELETE removed — sourcer attribution is immutable
}
