import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { AutomationRuleServiceV2 } from './service';
import { AutomationRuleRepository, CreateRuleInput } from './repository';
import { RuleFilters, RuleUpdate } from './types';
import { requireUserContext, validatePaginationParams } from '../shared/helpers';
import { IEventPublisher } from '../shared/events';
import { resolveAccessContext } from '../shared/access';

interface RegisterRuleRoutesConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: IEventPublisher;
}

export async function registerRuleRoutes(
    app: FastifyInstance,
    config: RegisterRuleRoutesConfig,
) {
    const repository = new AutomationRuleRepository(
        config.supabaseUrl,
        config.supabaseKey,
    );
    const accessClient = createClient(config.supabaseUrl, config.supabaseKey);
    const accessResolver = (clerkUserId: string) =>
        resolveAccessContext(accessClient, clerkUserId);
    const service = new AutomationRuleServiceV2(
        repository,
        accessResolver,
        config.eventPublisher,
    );

    app.get('/api/v2/automation-rules', async (request, reply) => {
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

            const filters: RuleFilters = {
                rule_type: query.rule_type,
                status: query.status,
                page: pagination.page,
                limit: pagination.limit,
                ...parsedFilters,
            };
            const result = await service.listRules(clerkUserId, filters);
            return reply.send(result);
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to fetch automation rules' },
            });
        }
    });

    app.get('/api/v2/automation-rules/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const rule = await service.getRule(clerkUserId, id);
            return reply.send({ data: rule });
        } catch (error: any) {
            return reply.code(404).send({
                error: { message: error.message || 'Automation rule not found' },
            });
        }
    });

    app.post('/api/v2/automation-rules', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as CreateRuleInput;
            if (!body?.name || !body.rule_type || !body.trigger_conditions || !body.actions) {
                return reply.code(400).send({
                    error: {
                        message: 'name, rule_type, trigger_conditions, and actions are required',
                    },
                });
            }
            body.created_by = clerkUserId;
            const rule = await service.createRule(clerkUserId, body);
            return reply.code(201).send({ data: rule });
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to create automation rule' },
            });
        }
    });

    app.patch('/api/v2/automation-rules/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as RuleUpdate;
            const rule = await service.updateRule(clerkUserId, id, updates);
            return reply.send({ data: rule });
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to update automation rule' },
            });
        }
    });

    app.delete('/api/v2/automation-rules/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            await service.deleteRule(clerkUserId, id);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(400).send({
                error: { message: error.message || 'Failed to delete automation rule' },
            });
        }
    });
}
