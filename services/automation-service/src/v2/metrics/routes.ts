import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { MarketplaceMetricsServiceV2 } from './service';
import { MarketplaceMetricsRepository, CreateMetricInput } from './repository';
import { MetricFilters, MetricUpdate } from './types';
import { requireUserContext, validatePaginationParams } from '../shared/helpers';
import { EventPublisher } from '../shared/events';
import { resolveAccessContext } from '../shared/access';

interface RegisterMetricRoutesConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: EventPublisher;
}

export async function registerMetricRoutes(
    app: FastifyInstance,
    config: RegisterMetricRoutesConfig
) {
    const repository = new MarketplaceMetricsRepository(config.supabaseUrl, config.supabaseKey);
    const accessClient = createClient(config.supabaseUrl, config.supabaseKey);
    const accessResolver = (clerkUserId: string) => resolveAccessContext(accessClient, clerkUserId);
    const service = new MarketplaceMetricsServiceV2(repository, accessResolver, config.eventPublisher);

    app.get('/v2/marketplace-metrics', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as Record<string, any>;
            const pagination = validatePaginationParams(query);

            // Parse filters object if present (comes as JSON string from query params)
            let parsedFilters: Record<string, any> = {};
            if (query.filters) {
                try {
                    parsedFilters = typeof query.filters === 'string'
                        ? JSON.parse(query.filters)
                        : query.filters;
                } catch (e) {
                    console.error('Failed to parse filters:', e);
                }
            }

            const filters: MetricFilters = {
                date_from: query.date_from,
                date_to: query.date_to,
                page: pagination.page,
                limit: pagination.limit,
                ...parsedFilters,
            };
            const result = await service.listMetrics(clerkUserId, filters);
            return reply.send(result);
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to fetch marketplace metrics' } });
        }
    });

    app.get('/v2/marketplace-metrics/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const metric = await service.getMetric(clerkUserId, id);
            return reply.send({ data: metric });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message || 'Marketplace metric not found' } });
        }
    });

    app.post('/v2/marketplace-metrics', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as CreateMetricInput;
            if (
                !body?.date ||
                typeof body.total_placements === 'undefined' ||
                typeof body.total_applications === 'undefined' ||
                typeof body.total_earnings_cents === 'undefined' ||
                typeof body.active_recruiters === 'undefined' ||
                typeof body.active_jobs === 'undefined' ||
                typeof body.health_score === 'undefined'
            ) {
                return reply.code(400).send({
                    error: { message: 'date, totals, activity, and health_score are required' },
                });
            }
            const metric = await service.createMetric(clerkUserId, body);
            return reply.code(201).send({ data: metric });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to create marketplace metric' } });
        }
    });

    app.patch('/v2/marketplace-metrics/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as MetricUpdate;
            const metric = await service.updateMetric(clerkUserId, id, updates);
            return reply.send({ data: metric });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to update marketplace metric' } });
        }
    });

    app.delete('/v2/marketplace-metrics/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            await service.deleteMetric(clerkUserId, id);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to delete marketplace metric' } });
        }
    });
}
