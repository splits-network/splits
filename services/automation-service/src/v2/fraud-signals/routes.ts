import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { FraudSignalServiceV2 } from './service';
import { FraudSignalRepository, CreateFraudSignalInput } from './repository';
import { FraudSignalFilters, FraudSignalUpdate } from './types';
import { requireUserContext, validatePaginationParams } from '../shared/helpers';
import { EventPublisher } from '../shared/events';
import { resolveAccessContext } from '../shared/access';

interface RegisterFraudRoutesConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: EventPublisher;
}

export async function registerFraudRoutes(
    app: FastifyInstance,
    config: RegisterFraudRoutesConfig
) {
    const repository = new FraudSignalRepository(config.supabaseUrl, config.supabaseKey);
    const accessClient = createClient(config.supabaseUrl, config.supabaseKey);
    const accessResolver = (clerkUserId: string) => resolveAccessContext(accessClient, clerkUserId);
    const service = new FraudSignalServiceV2(repository, accessResolver, config.eventPublisher);

    app.get('/v2/fraud-signals', async (request, reply) => {
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

            const filters: FraudSignalFilters = {
                entity_type: query.entity_type,
                entity_id: query.entity_id,
                severity: query.severity,
                status: query.status,
                signal_type: query.signal_type,
                page: pagination.page,
                limit: pagination.limit,
                ...parsedFilters,
            };
            const result = await service.listSignals(clerkUserId, filters);
            return reply.send(result);
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to fetch fraud signals' } });
        }
    });

    app.get('/v2/fraud-signals/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const signal = await service.getSignal(clerkUserId, id);
            return reply.send({ data: signal });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message || 'Fraud signal not found' } });
        }
    });

    app.post('/v2/fraud-signals', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as CreateFraudSignalInput;
            if (
                !body?.event_id ||
                !body.event_type ||
                !body.entity_type ||
                !body.entity_id ||
                !body.signal_type ||
                !body.severity ||
                !body.details
            ) {
                return reply.code(400).send({
                    error: { message: 'event_id, event_type, entity info, signal_type, severity, and details are required' },
                });
            }
            const signal = await service.createSignal(clerkUserId, body);
            return reply.code(201).send({ data: signal });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to create fraud signal' } });
        }
    });

    app.patch('/v2/fraud-signals/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as FraudSignalUpdate;
            const signal = await service.updateSignal(clerkUserId, id, updates);
            return reply.send({ data: signal });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to update fraud signal' } });
        }
    });

    app.delete('/v2/fraud-signals/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            await service.deleteSignal(clerkUserId, id);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to delete fraud signal' } });
        }
    });
}
