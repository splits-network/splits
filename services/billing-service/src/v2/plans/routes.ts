import { FastifyInstance } from 'fastify';
import { PlanServiceV2 } from './service';
import { requireUserContext, validatePaginationParams } from '../shared/helpers';

interface RegisterPlanRoutesConfig {
    planService: PlanServiceV2;
}

export function registerPlanRoutes(app: FastifyInstance, config: RegisterPlanRoutesConfig) {
    app.get('/api/v2/plans', async (request, reply) => {
        try {
            const pagination = validatePaginationParams(request.query as Record<string, any>);
            const filters = {
                ...(request.query as Record<string, any>),
                ...pagination,
            };
            const result = await config.planService.getPlans(filters);
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get('/api/v2/plans/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const plan = await config.planService.getPlan(id);
            return reply.send({ data: plan });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message } });
        }
    });

    app.post('/api/v2/plans', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const plan = await config.planService.createPlan(request.body as any, clerkUserId);
            return reply.code(201).send({ data: plan });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.patch('/api/v2/plans/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const plan = await config.planService.updatePlan(id, request.body as any, clerkUserId);
            return reply.send({ data: plan });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.delete('/api/v2/plans/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            await config.planService.deletePlan(id, clerkUserId);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });
}
