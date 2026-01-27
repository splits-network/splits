import { FastifyInstance } from 'fastify';
import { SubscriptionServiceV2 } from './service';
import { requireUserContext, validatePaginationParams } from '../shared/helpers';
import { SetupIntentRequest, ActivateSubscriptionRequest, UpdatePaymentMethodRequest } from './types';

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

    // GET /payment-methods - Fetch payment method info from Stripe
    app.get('/api/v2/subscriptions/payment-methods', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const paymentMethods = await config.subscriptionService.getPaymentMethods(clerkUserId);
            return reply.send({ data: paymentMethods });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to fetch payment methods' } });
        }
    });

    // POST /update-payment-method - Update default payment method
    app.post('/api/v2/subscriptions/update-payment-method', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as UpdatePaymentMethodRequest;

            if (!body.payment_method_id) {
                return reply.code(400).send({ error: { message: 'payment_method_id is required' } });
            }

            const result = await config.subscriptionService.updatePaymentMethod(
                clerkUserId,
                body.payment_method_id
            );
            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // GET /invoices - Fetch billing history from Stripe
    app.get('/api/v2/subscriptions/invoices', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as { limit?: string };
            const limit = query.limit ? parseInt(query.limit, 10) : 10;
            
            const invoices = await config.subscriptionService.getInvoices(clerkUserId, limit);
            return reply.send({ data: invoices });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to fetch invoices' } });
        }
    });

    // POST /setup-intent - Create Stripe SetupIntent for payment collection
    app.post('/api/v2/subscriptions/setup-intent', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as SetupIntentRequest;

            if (!body.plan_id) {
                return reply.code(400).send({ error: { message: 'plan_id is required' } });
            }

            const result = await config.subscriptionService.createSetupIntent(body, clerkUserId);
            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // POST /activate - Activate subscription after payment method collection
    app.post('/api/v2/subscriptions/activate', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as ActivateSubscriptionRequest;

            if (!body.plan_id) {
                return reply.code(400).send({ error: { message: 'plan_id is required' } });
            }

            const result = await config.subscriptionService.activateSubscription(body, clerkUserId);
            return reply.code(201).send({ data: result });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
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
}
