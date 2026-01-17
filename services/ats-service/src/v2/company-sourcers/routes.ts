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
                    sourcer_recruiter_id: { type: 'string', format: 'uuid' },
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
                company_id: params.company_id,
                sourcer_recruiter_id: params.sourcer_recruiter_id,
                sourcer_type: params.sourcer_type,
                active_protection: params.active_protection,
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
                required: ['company_id', 'sourcer_recruiter_id', 'sourcer_type', 'protection_expires_at'],
                properties: {
                    company_id: { type: 'string', format: 'uuid' },
                    sourcer_recruiter_id: { type: 'string', format: 'uuid' },
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
            company_id: body.company_id,
            sourcer_recruiter_id: body.sourcer_recruiter_id,
            sourcer_type: body.sourcer_type,
            sourced_at: body.sourced_at ? new Date(body.sourced_at) : undefined,
            protection_window_days: body.protection_window_days,
            protection_expires_at: new Date(body.protection_expires_at),
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
