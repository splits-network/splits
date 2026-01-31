import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { ResourceDefinition, registerResourceRoutes, getCorrelationId } from './common';
import { requireAuth } from '../../middleware/auth';
import { buildAuthHeaders } from '../../helpers/auth-headers';

const BILLING_RESOURCES: ResourceDefinition[] = [
    {
        name: 'plans',
        service: 'billing',
        basePath: '/plans',
        tag: 'billing',
    },
    {
        name: 'subscriptions',
        service: 'billing',
        basePath: '/subscriptions',
        tag: 'billing',
    },
    {
        name: 'payouts',
        service: 'billing',
        basePath: '/payouts',
        tag: 'billing',
    },
    {
        name: 'payout-schedules',
        service: 'billing',
        basePath: '/payout-schedules',
        tag: 'billing',
    },
    {
        name: 'escrow-holds',
        service: 'billing',
        basePath: '/escrow-holds',
        tag: 'billing',
    },
];

function registerSubscriptionMeRoute(app: FastifyInstance, services: ServiceRegistry) {
    const billingService = () => services.get('billing');

    app.get(
        '/api/v2/subscriptions/me',
        {
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                const data = await billingService().get(
                    '/api/v2/subscriptions/me',
                    undefined,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to fetch current subscription');
                return reply
                    .status(error.statusCode || 404)
                    .send(error.jsonBody || { error: { message: 'No active subscription found' } });
            }
        }
    );
}

function registerSubscriptionSetupIntentRoute(app: FastifyInstance, services: ServiceRegistry) {
    const billingService = () => services.get('billing');

    app.post(
        '/api/v2/subscriptions/setup-intent',
        {
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                const data = await billingService().post(
                    '/api/v2/subscriptions/setup-intent',
                    request.body,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to create setup intent');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to create setup intent' } });
            }
        }
    );
}

function registerSubscriptionActivateRoute(app: FastifyInstance, services: ServiceRegistry) {
    const billingService = () => services.get('billing');

    app.post(
        '/api/v2/subscriptions/activate',
        {
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                const data = await billingService().post(
                    '/api/v2/subscriptions/activate',
                    request.body,
                    correlationId,
                    authHeaders
                );
                return reply.status(201).send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to activate subscription');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to activate subscription' } });
            }
        }
    );
}

function registerSubscriptionPaymentMethodsRoute(app: FastifyInstance, services: ServiceRegistry) {
    const billingService = () => services.get('billing');

    app.get(
        '/api/v2/subscriptions/payment-methods',
        {
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                const data = await billingService().get(
                    '/api/v2/subscriptions/payment-methods',
                    undefined,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to fetch payment methods');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to fetch payment methods' } });
            }
        }
    );
}

function registerSubscriptionUpdatePaymentMethodRoute(app: FastifyInstance, services: ServiceRegistry) {
    const billingService = () => services.get('billing');

    app.post(
        '/api/v2/subscriptions/update-payment-method',
        {
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                const data = await billingService().post(
                    '/api/v2/subscriptions/update-payment-method',
                    request.body,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to update payment method');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to update payment method' } });
            }
        }
    );
}

function registerSubscriptionInvoicesRoute(app: FastifyInstance, services: ServiceRegistry) {
    const billingService = () => services.get('billing');

    app.get(
        '/api/v2/subscriptions/invoices',
        {
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const query = request.query as { limit?: string };

            try {
                const params = query.limit ? { limit: query.limit } : undefined;
                const data = await billingService().get(
                    '/api/v2/subscriptions/invoices',
                    params,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to fetch invoices');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to fetch invoices' } });
            }
        }
    );
}

function registerDiscountValidationRoute(app: FastifyInstance, services: ServiceRegistry) {
    const billingService = () => services.get('billing');

    app.post(
        '/api/v2/discounts/validate',
        {
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                const data = await billingService().post(
                    '/api/v2/discounts/validate',
                    request.body,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to validate discount code');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to validate discount code' } });
            }
        }
    );
}

export function registerBillingRoutes(app: FastifyInstance, services: ServiceRegistry) {
    // Register specific routes FIRST (must be before generic CRUD routes)
    registerSubscriptionMeRoute(app, services);
    registerSubscriptionSetupIntentRoute(app, services);
    registerSubscriptionActivateRoute(app, services);
    registerSubscriptionPaymentMethodsRoute(app, services);
    registerSubscriptionUpdatePaymentMethodRoute(app, services);
    registerSubscriptionInvoicesRoute(app, services);
    registerDiscountValidationRoute(app, services);

    BILLING_RESOURCES.forEach(resource => registerResourceRoutes(app, services, resource));
}
