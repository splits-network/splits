import { FastifyInstance } from 'fastify';
import { SubscriptionServiceV2 } from './service';
import { requireUserContext, validatePaginationParams } from '../shared/helpers';

interface RegisterSubscriptionRoutesConfig {
    subscriptionService: SubscriptionServiceV2;
}

export function registerSubscriptionRoutes(
    app: FastifyInstance,
    config: RegisterSubscriptionRoutesConfig
) {
    app.get('/v2/subscriptions', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const pagination = validatePaginationParams(request.query as Record<string, any>);
            const filters = {
                ...(request.query as Record<string, any>),
                ...pagination,
            };
            const result = await config.subscriptionService.getSubscriptions(filters, clerkUserId);
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get('/v2/subscriptions/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const subscription = await config.subscriptionService.getSubscription(id, clerkUserId);
            return reply.send({ data: subscription });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message } });
        }
    });

    app.post('/v2/subscriptions', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const subscription = await config.subscriptionService.createSubscription(
                request.body as any,
                clerkUserId
            );
            return reply.code(201).send({ data: subscription });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.patch('/v2/subscriptions/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const subscription = await config.subscriptionService.updateSubscription(
                id,
                request.body as any,
                clerkUserId
            );
            return reply.send({ data: subscription });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.delete('/v2/subscriptions/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const subscription = await config.subscriptionService.cancelSubscription(id, clerkUserId);
            return reply.send({ data: subscription });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });
}
