import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { AutomationExecutionServiceV2 } from './service.js';
import { AutomationExecutionRepository } from './repository.js';
import { ExecutionFilters } from './types.js';
import { requireUserContext, validatePaginationParams } from '../shared/helpers.js';
import { IEventPublisher } from '../shared/events.js';
import { resolveAccessContext } from '../shared/access.js';
import { createLogger } from '@splits-network/shared-logging';

interface RegisterExecutionRoutesConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: IEventPublisher;
}

export async function registerExecutionRoutes(
    app: FastifyInstance,
    config: RegisterExecutionRoutesConfig,
) {
    const repository = new AutomationExecutionRepository(
        config.supabaseUrl,
        config.supabaseKey,
    );
    const accessClient = createClient(config.supabaseUrl, config.supabaseKey);
    const accessResolver = (clerkUserId: string) =>
        resolveAccessContext(accessClient, clerkUserId);
    const logger = createLogger({
        serviceName: 'automation-service',
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
        prettyPrint: process.env.NODE_ENV === 'development',
    });
    const service = new AutomationExecutionServiceV2(
        repository,
        accessResolver,
        config.eventPublisher,
        logger,
    );

    app.get('/api/v2/automation-executions', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as Record<string, any>;
            const pagination = validatePaginationParams(query);

            const filters: ExecutionFilters = {
                rule_id: query.rule_id,
                status: query.status,
                entity_type: query.entity_type,
                requires_approval: query.requires_approval === 'true' ? true : undefined,
                page: pagination.page,
                limit: pagination.limit,
            };
            const result = await service.listExecutions(clerkUserId, filters);
            return reply.send(result);
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to fetch executions' },
            });
        }
    });

    app.get('/api/v2/automation-executions/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const execution = await service.getExecution(clerkUserId, id);
            return reply.send({ data: execution });
        } catch (error: any) {
            return reply.code(404).send({
                error: { message: error.message || 'Execution not found' },
            });
        }
    });

    app.post('/api/v2/automation-executions/:id/approve', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const execution = await service.approveExecution(clerkUserId, id);
            return reply.send({ data: execution });
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to approve execution' },
            });
        }
    });

    app.post('/api/v2/automation-executions/:id/reject', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const body = request.body as { reason?: string } || {};
            const execution = await service.rejectExecution(clerkUserId, id, body.reason);
            return reply.send({ data: execution });
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to reject execution' },
            });
        }
    });
}
