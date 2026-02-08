import { FastifyInstance } from 'fastify';
import { CompanySourcerServiceV2 } from './service';
import { requireUserContext } from '../helpers';

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

    // Create company sourcer
    app.post('/company-sourcers', {
        schema: {
            description: 'Create a new company sourcer record',
            tags: ['company-sourcers'],
            body: {
                type: 'object',
                required: ['company_id', 'recruiter_id'],
                properties: {
                    company_id: { type: 'string', format: 'uuid' },
                    recruiter_id: { type: 'string', format: 'uuid' },
                    relationship_start_date: { type: 'string', format: 'date-time' },
                    notes: { type: 'string' },
                },
            },
        },
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const body = request.body as any;

        const sourcer = await service.create(clerkUserId, {
            company_id: body.company_id,
            recruiter_id: body.recruiter_id,
            relationship_start_date: body.relationship_start_date,
            notes: body.notes,
        });

        return reply.code(201).send({ data: sourcer });
    });

    // Update company sourcer
    app.patch('/company-sourcers/:id', {
        schema: {
            description: 'Update a company sourcer record',
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
                    status: { type: 'string', enum: ['pending', 'active', 'declined', 'terminated'] },
                    relationship_end_date: { type: 'string', format: 'date-time' },
                    termination_reason: { type: 'string' },
                },
            },
        },
    }, async (request, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { id } = request.params as { id: string };
        const body = request.body as any;

        const updated = await service.update(id, clerkUserId, {
            status: body.status,
            relationship_end_date: body.relationship_end_date,
            termination_reason: body.termination_reason,
        });

        return reply.send({ data: updated });
    });

    // Delete company sourcer
    app.delete('/company-sourcers/:id', {
        schema: {
            description: 'Delete a company sourcer record (admin only)',
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

        await service.delete(id, clerkUserId);
        return reply.send({ data: { message: 'Company sourcer deleted successfully' } });
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
}
