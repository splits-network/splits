import { FastifyInstance } from 'fastify';
import { ReputationServiceV2 } from './service';
import { requireUserContext } from '../shared/helpers';
import { validatePaginationParams } from '../shared/pagination';

interface RegisterReputationRoutesConfig {
    reputationService: ReputationServiceV2;
}

export function registerReputationRoutes(
    app: FastifyInstance,
    config: RegisterReputationRoutesConfig
) {
    app.get('/api/v2/reputation', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as any;

            const pagination = validatePaginationParams(query.page, query.limit);
            const filters = {
                ...pagination,
                recruiter_id: query.recruiter_id,
                sort_by: query.sort_by,
                sort_order: query.sort_order,
            };

            const result = await config.reputationService.getReputations(clerkUserId, filters);
            return reply.send(result);
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    app.get('/api/v2/reputation/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            const record = await config.reputationService.getReputation(id);
            return reply.send({ data: record });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    app.post('/api/v2/reputation', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;
            const record = await config.reputationService.createReputation(body, clerkUserId);
            return reply.code(201).send({ data: record });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    app.patch('/api/v2/reputation/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as any;
            const record = await config.reputationService.updateReputation(id, updates, clerkUserId);
            return reply.send({ data: record });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    app.delete('/api/v2/reputation/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            await config.reputationService.deleteReputation(id, clerkUserId);
            return reply.code(204).send();
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });
}
