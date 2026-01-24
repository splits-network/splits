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

function registerCustomBillingRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const billingService = () => services.get('billing');

    // GET /subscriptions/me - Current user's subscription
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

    // POST /subscriptions/checkout-session - Create Stripe checkout session
    app.post(
        '/api/v2/subscriptions/checkout-session',
        {
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                const data = await billingService().post(
                    '/api/v2/subscriptions/checkout-session',
                    request.body,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to create checkout session');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: 'Failed to create checkout session' } });
            }
        }
    );

    // POST /subscriptions/portal-session - Create Stripe billing portal session
    app.post(
        '/api/v2/subscriptions/portal-session',
        {
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                const data = await billingService().post(
                    '/api/v2/subscriptions/portal-session',
                    request.body,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to create portal session');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: 'Failed to create billing portal session' } });
            }
        }
    );
}

export function registerBillingRoutes(app: FastifyInstance, services: ServiceRegistry) {
    // Register custom routes FIRST (must be before generic CRUD routes)
    registerCustomBillingRoutes(app, services);

    BILLING_RESOURCES.forEach(resource => registerResourceRoutes(app, services, resource));
}
