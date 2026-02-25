import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { FraudSignalServiceV2 } from './service';
import { FraudSignalRepository, CreateFraudSignalInput } from './repository';
import { FraudSignalFilters, FraudSignalUpdate } from './types';
import { requireUserContext, validatePaginationParams } from '../shared/helpers';
import { IEventPublisher } from '../shared/events';
import { resolveAccessContext } from '../shared/access';

interface RegisterFraudRoutesConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: IEventPublisher;
}

export async function registerFraudRoutes(
    app: FastifyInstance,
    config: RegisterFraudRoutesConfig,
) {
    const repository = new FraudSignalRepository(
        config.supabaseUrl,
        config.supabaseKey,
    );
    const accessClient = createClient(config.supabaseUrl, config.supabaseKey);
    const accessResolver = (clerkUserId: string) =>
        resolveAccessContext(accessClient, clerkUserId);
    const service = new FraudSignalServiceV2(
        repository,
        accessResolver,
        config.eventPublisher,
    );

    app.get('/api/v2/fraud-signals', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as Record<string, any>;
            const pagination = validatePaginationParams(query);

            let parsedFilters: Record<string, any> = {};
            if (query.filters) {
                try {
                    parsedFilters =
                        typeof query.filters === 'string'
                            ? JSON.parse(query.filters)
                            : query.filters;
                } catch (e) {
                    console.error('Failed to parse filters:', e);
                }
            }

            const filters: FraudSignalFilters = {
                recruiter_id: query.recruiter_id,
                candidate_id: query.candidate_id,
                application_id: query.application_id,
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
            return reply.code(400).send({
                error: { message: error.message || 'Failed to fetch fraud signals' },
            });
        }
    });

    app.get('/api/v2/fraud-signals/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const signal = await service.getSignal(clerkUserId, id);
            return reply.send({ data: signal });
        } catch (error: any) {
            return reply.code(404).send({
                error: { message: error.message || 'Fraud signal not found' },
            });
        }
    });

    app.post('/api/v2/fraud-signals', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as CreateFraudSignalInput;
            if (!body?.signal_type || !body.severity || !body.signal_data || body.confidence_score == null) {
                return reply.code(400).send({
                    error: {
                        message: 'signal_type, severity, signal_data, and confidence_score are required',
                    },
                });
            }
            const signal = await service.createSignal(clerkUserId, body);
            return reply.code(201).send({ data: signal });
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to create fraud signal' },
            });
        }
    });

    app.patch('/api/v2/fraud-signals/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as FraudSignalUpdate;
            const signal = await service.updateSignal(clerkUserId, id, updates);
            return reply.send({ data: signal });
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to update fraud signal' },
            });
        }
    });

    app.delete('/api/v2/fraud-signals/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            await service.deleteSignal(clerkUserId, id);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to delete fraud signal' },
            });
        }
    });
}
