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

function registerStripeConnectRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const billingService = () => services.get('billing');

    app.get(
        '/api/v2/stripe/connect/account',
        {
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                const data = await billingService().get(
                    '/api/v2/stripe/connect/account',
                    undefined,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to fetch Stripe Connect account');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to fetch Stripe Connect account' } });
            }
        }
    );

    app.post(
        '/api/v2/stripe/connect/account',
        {
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                const data = await billingService().post(
                    '/api/v2/stripe/connect/account',
                    request.body,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to create Stripe Connect account');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to create Stripe Connect account' } });
            }
        }
    );

    app.post(
        '/api/v2/stripe/connect/onboarding-link',
        {
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                const data = await billingService().post(
                    '/api/v2/stripe/connect/onboarding-link',
                    request.body,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to create Stripe Connect onboarding link');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to create Stripe Connect onboarding link' } });
            }
        }
    );

    app.post(
        '/api/v2/stripe/connect/account-session',
        {
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                const data = await billingService().post(
                    '/api/v2/stripe/connect/account-session',
                    request.body,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to create Stripe Connect account session');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to create Stripe Connect account session' } });
            }
        }
    );

    app.post(
        '/api/v2/stripe/connect/dashboard-link',
        {
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                const data = await billingService().post(
                    '/api/v2/stripe/connect/dashboard-link',
                    request.body,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to create Stripe Connect dashboard link');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to create Stripe Connect dashboard link' } });
            }
        }
    );
}

function registerPayoutTransactionRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const billingService = () => services.get('billing');

    app.post(
        '/api/v2/payout-transactions/:id/process',
        {
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const { id } = request.params as { id: string };

            try {
                const data = await billingService().post(
                    `/api/v2/payout-transactions/${id}/process`,
                    request.body,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to process payout transaction');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to process payout transaction' } });
            }
        }
    );

    app.post(
        '/api/v2/placements/:placementId/payout-transactions/process',
        {
            preHandler: requireAuth(),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const { placementId } = request.params as { placementId: string };

            try {
                const data = await billingService().post(
                    `/api/v2/placements/${placementId}/payout-transactions/process`,
                    request.body,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to process placement payout transactions');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to process placement payout transactions' } });
            }
        }
    );
}

function registerCompanyBillingProfileRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const billingService = () => services.get('billing');

    app.get(
        '/api/v2/company-billing-profiles',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            try {
                const data = await billingService().get(
                    '/api/v2/company-billing-profiles',
                    request.query as Record<string, any>,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to list company billing profiles');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to list company billing profiles' } });
            }
        }
    );

    app.get(
        '/api/v2/company-billing-profiles/:companyId',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const { companyId } = request.params as { companyId: string };

            try {
                const data = await billingService().get(
                    `/api/v2/company-billing-profiles/${companyId}`,
                    undefined,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to fetch company billing profile');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to fetch company billing profile' } });
            }
        }
    );

    app.post(
        '/api/v2/company-billing-profiles/:companyId',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const { companyId } = request.params as { companyId: string };

            try {
                const data = await billingService().post(
                    `/api/v2/company-billing-profiles/${companyId}`,
                    request.body,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to upsert company billing profile');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to upsert company billing profile' } });
            }
        }
    );

    app.patch(
        '/api/v2/company-billing-profiles/:companyId',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const { companyId } = request.params as { companyId: string };

            try {
                const data = await billingService().patch(
                    `/api/v2/company-billing-profiles/${companyId}`,
                    request.body,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to update company billing profile');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to update company billing profile' } });
            }
        }
    );

    app.post(
        '/api/v2/company-billing-profiles/:companyId/setup-intent',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const { companyId } = request.params as { companyId: string };

            try {
                const data = await billingService().post(
                    `/api/v2/company-billing-profiles/${companyId}/setup-intent`,
                    request.body,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to create company setup intent');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to create company setup intent' } });
            }
        }
    );

    app.get(
        '/api/v2/company-billing-profiles/:companyId/payment-method',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const { companyId } = request.params as { companyId: string };

            try {
                const data = await billingService().get(
                    `/api/v2/company-billing-profiles/${companyId}/payment-method`,
                    undefined,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to fetch company payment method');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to fetch company payment method' } });
            }
        }
    );

    app.post(
        '/api/v2/company-billing-profiles/:companyId/payment-method',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const { companyId } = request.params as { companyId: string };

            try {
                const data = await billingService().post(
                    `/api/v2/company-billing-profiles/${companyId}/payment-method`,
                    request.body,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to update company payment method');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to update company payment method' } });
            }
        }
    );

    app.get(
        '/api/v2/company-billing-profiles/:companyId/billing-readiness',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const { companyId } = request.params as { companyId: string };

            try {
                const data = await billingService().get(
                    `/api/v2/company-billing-profiles/${companyId}/billing-readiness`,
                    undefined,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to fetch company billing readiness');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to fetch company billing readiness' } });
            }
        }
    );
}

function registerStripeWebhookProxy(app: FastifyInstance, services: ServiceRegistry) {
    const billingService = () => services.get('billing');

    // Proxy Stripe webhook to billing service
    // No auth required - verified by Stripe signature
    // Pass raw body for signature verification
    app.post(
        '/api/billing/webhooks/stripe',
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const stripeSignature = request.headers['stripe-signature'];
            const rawBody = (request as any).rawBody as Buffer;

            if (!rawBody) {
                request.log.error({ correlationId }, 'Missing raw body for webhook');
                return reply.status(400).send({ error: { message: 'Missing raw body' } });
            }

            try {
                const data = await billingService().post(
                    '/webhooks/stripe',
                    rawBody,
                    correlationId,
                    {
                        'stripe-signature': stripeSignature as string,
                        'content-type': 'application/json',
                    }
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Stripe webhook proxy failed');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: { message: error.message || 'Webhook processing failed' } });
            }
        }
    );
}

function registerPlacementInvoiceRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const billingService = () => services.get('billing');

    app.get(
        '/api/v2/placements/:placementId/invoices',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const { placementId } = request.params as { placementId: string };

            try {
                const data = await billingService().get(
                    `/api/v2/placements/${placementId}/invoices`,
                    undefined,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to fetch placement invoice');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to fetch placement invoice' } });
            }
        }
    );

    app.post(
        '/api/v2/placements/:placementId/invoices',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const { placementId } = request.params as { placementId: string };

            try {
                const data = await billingService().post(
                    `/api/v2/placements/${placementId}/invoices`,
                    request.body,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to create placement invoice');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to create placement invoice' } });
            }
        }
    );

    app.get(
        '/api/v2/company-billing-profiles/:companyId/invoices',
        { preHandler: requireAuth() },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const { companyId } = request.params as { companyId: string };

            try {
                const data = await billingService().get(
                    `/api/v2/company-billing-profiles/${companyId}/invoices`,
                    request.query as Record<string, any>,
                    correlationId,
                    authHeaders
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to fetch company invoices');
                return reply
                    .status(error.statusCode || 400)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to fetch company invoices' } });
            }
        }
    );
}

function registerPublicPlansRoute(app: FastifyInstance, services: ServiceRegistry) {
    const billingService = () => services.get('billing');

    // Public access to list plans for pricing page
    app.get(
        '/api/v2/plans',
        // No preHandler auth - this is public
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            
            try {
                // Call billing service without auth headers since this is public
                const data = await billingService().get(
                    '/api/v2/plans',
                    request.query as Record<string, any>,
                    correlationId,
                    {} // No auth headers for public access
                );
                return reply.send(data);
            } catch (error: any) {
                request.log.error({ error, correlationId }, 'Failed to fetch public plans');
                return reply
                    .status(error.statusCode || 500)
                    .send(error.jsonBody || { error: { message: error.message || 'Failed to fetch plans' } });
            }
        }
    );
}

export function registerBillingRoutes(app: FastifyInstance, services: ServiceRegistry) {
    // Register webhook proxy (no auth - verified by Stripe signature)
    registerStripeWebhookProxy(app, services);

    // Register PUBLIC routes FIRST (must be before auth routes that conflict)
    registerPublicPlansRoute(app, services);

    // Register specific auth-required routes
    registerSubscriptionMeRoute(app, services);
    registerSubscriptionSetupIntentRoute(app, services);
    registerSubscriptionActivateRoute(app, services);
    registerSubscriptionPaymentMethodsRoute(app, services);
    registerSubscriptionUpdatePaymentMethodRoute(app, services);
    registerSubscriptionInvoicesRoute(app, services);
    registerDiscountValidationRoute(app, services);
    registerStripeConnectRoutes(app, services);
    registerPayoutTransactionRoutes(app, services);
    registerCompanyBillingProfileRoutes(app, services);
    registerPlacementInvoiceRoutes(app, services);

    // Register other billing resources (excluding plans which is handled above)
    BILLING_RESOURCES.filter(resource => resource.name !== 'plans')
        .forEach(resource => registerResourceRoutes(app, services, resource));
}
