import { FastifyInstance } from 'fastify';
import { MarketplaceMetricsServiceV2 } from './service';
import { MetricFilters, MetricUpdate, CreateMetricInput } from './types';
import { requireUserContext } from '../shared/access';

interface RegisterMarketplaceMetricsRoutesConfig {
    marketplaceMetricsService: MarketplaceMetricsServiceV2;
}

/**
 * Register marketplace metrics routes
 * Migrated from automation-service to analytics-service
 */
export async function registerMarketplaceMetricsRoutes(
    app: FastifyInstance,
    config: RegisterMarketplaceMetricsRoutesConfig
) {
    const { marketplaceMetricsService } = config;

    /**
     * List marketplace metrics
     * GET /v2/marketplace-metrics
     */
    app.get('/api/v2/marketplace-metrics', {
        schema: {
            description: 'List marketplace metrics (Platform admin only)',
            tags: ['marketplace-metrics'],
            querystring: {
                type: 'object',
                properties: {
                    date_from: { type: 'string', format: 'date' },
                    date_to: { type: 'string', format: 'date' },
                    page: { type: 'integer', minimum: 1, default: 1 },
                    limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        data: { type: 'array' },
                        pagination: { type: 'object' },
                    },
                },
            },
        },
    }, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as Record<string, any>;

            const filters: MetricFilters = {
                date_from: query.date_from,
                date_to: query.date_to,
                page: query.page ? parseInt(query.page, 10) : 1,
                limit: query.limit ? parseInt(query.limit, 10) : 25,
            };

            const result = await marketplaceMetricsService.list(clerkUserId, filters);
            return reply.send(result);
        } catch (error: any) {
            const statusCode = error.message.includes('admin') ? 403 : 400;
            return reply.code(statusCode as any).send({
                error: { message: error.message || 'Failed to fetch marketplace metrics' },
            });
        }
    });

    /**
     * Get marketplace metric by ID
     * GET /v2/marketplace-metrics/:id
     */
    app.get('/api/v2/marketplace-metrics/:id', {
        schema: {
            description: 'Get marketplace metric by ID (Platform admin only)',
            tags: ['marketplace-metrics'],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        data: { type: 'object' },
                    },
                },
            },
        },
    }, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const metric = await marketplaceMetricsService.get(clerkUserId, id);
            return reply.send({ data: metric });
        } catch (error: any) {
            const statusCode = error.message.includes('not found') ? 404 :
                error.message.includes('admin') ? 403 : 400;
            return reply.code(statusCode as any).send({
                error: { message: error.message || 'Marketplace metric not found' },
            });
        }
    });

    /**
     * Create marketplace metric
     * POST /v2/marketplace-metrics
     */
    app.post('/api/v2/marketplace-metrics', {
        schema: {
            description: 'Create marketplace metric (Platform admin only)',
            tags: ['marketplace-metrics'],
            body: {
                type: 'object',
                required: [
                    'date',
                    'total_placements',
                    'total_applications',
                    'total_earnings_cents',
                    'active_recruiters',
                    'active_jobs',
                    'health_score',
                ],
                properties: {
                    date: { type: 'string', format: 'date' },
                    total_placements: { type: 'integer', minimum: 0 },
                    total_applications: { type: 'integer', minimum: 0 },
                    total_earnings_cents: { type: 'integer', minimum: 0 },
                    avg_placement_duration_days: { type: ['number', 'null'] },
                    active_recruiters: { type: 'integer', minimum: 0 },
                    active_jobs: { type: 'integer', minimum: 0 },
                    health_score: { type: 'number', minimum: 0, maximum: 100 },
                },
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        data: { type: 'object' },
                    },
                },
            },
        },
    }, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as CreateMetricInput;
            const metric = await marketplaceMetricsService.create(clerkUserId, body);
            return reply.code(201).send({ data: metric });
        } catch (error: any) {
            const statusCode = error.message.includes('admin') ? 403 : 400;
            return reply.code(statusCode as any).send({
                error: { message: error.message || 'Failed to create marketplace metric' },
            });
        }
    });

    /**
     * Update marketplace metric
     * PATCH /v2/marketplace-metrics/:id
     */
    app.patch('/api/v2/marketplace-metrics/:id', {
        schema: {
            description: 'Update marketplace metric (Platform admin only)',
            tags: ['marketplace-metrics'],
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
                    date: { type: 'string', format: 'date' },
                    total_placements: { type: 'integer', minimum: 0 },
                    total_applications: { type: 'integer', minimum: 0 },
                    total_earnings_cents: { type: 'integer', minimum: 0 },
                    avg_placement_duration_days: { type: ['number', 'null'] },
                    active_recruiters: { type: 'integer', minimum: 0 },
                    active_jobs: { type: 'integer', minimum: 0 },
                    health_score: { type: 'number', minimum: 0, maximum: 100 },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        data: { type: 'object' },
                    },
                },
            },
        },
    }, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as MetricUpdate;
            const metric = await marketplaceMetricsService.update(clerkUserId, id, updates);
            return reply.send({ data: metric });
        } catch (error: any) {
            const statusCode = error.message.includes('not found') ? 404 :
                error.message.includes('admin') ? 403 : 400;
            return reply.code(statusCode as any).send({
                error: { message: error.message || 'Failed to update marketplace metric' },
            });
        }
    });

    /**
     * Delete marketplace metric
     * DELETE /v2/marketplace-metrics/:id
     */
    app.delete('/api/v2/marketplace-metrics/:id', {
        schema: {
            description: 'Delete marketplace metric (Platform admin only)',
            tags: ['marketplace-metrics'],
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                message: { type: 'string' },
                            },
                        },
                    },
                },
            },
        },
    }, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            await marketplaceMetricsService.delete(clerkUserId, id);
            return reply.send({ data: { message: 'Marketplace metric deleted successfully' } });
        } catch (error: any) {
            const statusCode = error.message.includes('not found') ? 404 :
                error.message.includes('admin') ? 403 : 400;
            return reply.code(statusCode as any).send({
                error: { message: error.message || 'Failed to delete marketplace metric' },
            });
        }
    });
}
