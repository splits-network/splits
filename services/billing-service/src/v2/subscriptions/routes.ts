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
    // GET /me endpoint - must be BEFORE generic /subscriptions routes
    app.get('/api/v2/subscriptions/me', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const subscription = await config.subscriptionService.getSubscriptionByClerkId(clerkUserId);
            return reply.send({ data: subscription });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 404)
                .send({ error: { message: error.message || 'No active subscription found' } });
        }
    });

    app.get('/api/v2/subscriptions', async (request, reply) => {
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

    app.get('/api/v2/subscriptions/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const subscription = await config.subscriptionService.getSubscription(id, clerkUserId);
            return reply.send({ data: subscription });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message } });
        }
    });

    app.post('/api/v2/subscriptions', async (request, reply) => {
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

    app.patch('/api/v2/subscriptions/:id', async (request, reply) => {
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

    app.delete('/api/v2/subscriptions/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const subscription = await config.subscriptionService.cancelSubscription(id, clerkUserId);
            return reply.send({ data: subscription });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // Stripe-specific routes
    app.post('/api/v2/subscriptions/checkout-session', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { plan_id, success_url, cancel_url } = request.body as {
                plan_id: string;
                success_url?: string;
                cancel_url?: string;
            };

            if (!plan_id) {
                return reply.code(400).send({
                    error: { message: 'plan_id is required' }
                });
            }

            const result = await config.subscriptionService.createCheckoutSession(
                plan_id,
                clerkUserId,
                success_url,
                cancel_url
            );

            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.post('/api/v2/subscriptions/portal-session', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { return_url } = request.body as { return_url?: string };

            const result = await config.subscriptionService.createPortalSession(
                clerkUserId,
                return_url
            );

            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });
}
