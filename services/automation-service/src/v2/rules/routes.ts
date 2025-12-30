import { FastifyInstance } from 'fastify';
import { AutomationRuleServiceV2 } from './service';
import { AutomationRuleRepository, CreateRuleInput } from './repository';
import { RuleFilters, RuleUpdate } from './types';
import { requireUserContext, validatePaginationParams } from '../shared/helpers';
import { EventPublisher } from '../shared/events';

interface RegisterRuleRoutesConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: EventPublisher;
}

export async function registerRuleRoutes(
    app: FastifyInstance,
    config: RegisterRuleRoutesConfig
) {
    const repository = new AutomationRuleRepository(config.supabaseUrl, config.supabaseKey);
    const service = new AutomationRuleServiceV2(repository, config.eventPublisher);

    app.get('/v2/automation-rules', async (request, reply) => {
        try {
            requireUserContext(request);
            const query = request.query as Record<string, any>;
            const pagination = validatePaginationParams(query);
            const filters: RuleFilters = {
                trigger_type: query.trigger_type,
                status: query.status,
                page: pagination.page,
                limit: pagination.limit,
            };
            const result = await service.listRules(filters);
            return reply.send(result);
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to fetch automation rules' } });
        }
    });

    app.get('/v2/automation-rules/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            const rule = await service.getRule(id);
            return reply.send({ data: rule });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message || 'Automation rule not found' } });
        }
    });

    app.post('/v2/automation-rules', async (request, reply) => {
        try {
            requireUserContext(request);
            const body = request.body as CreateRuleInput;
            if (!body?.name || !body.trigger_type || !body.condition || !body.action) {
                return reply.code(400).send({
                    error: { message: 'name, trigger_type, condition, and action are required' },
                });
            }
            const rule = await service.createRule(body);
            return reply.code(201).send({ data: rule });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to create automation rule' } });
        }
    });

    app.patch('/v2/automation-rules/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as RuleUpdate;
            const rule = await service.updateRule(id, updates);
            return reply.send({ data: rule });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to update automation rule' } });
        }
    });

    app.delete('/v2/automation-rules/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            await service.deleteRule(id);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to delete automation rule' } });
        }
    });
}
