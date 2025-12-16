import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { requireRoles } from '../../rbac';

/**
 * Billing Routes
 * - Subscription management
 * - Stripe webhooks
 */
export function registerBillingRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const billingService = () => services.get('billing');
    const getCorrelationId = (request: FastifyRequest) => (request as any).correlationId;

    // Stripe webhook (NO AUTH - verified by Stripe signature)
    app.post('/api/billing/webhooks/stripe', {
        schema: {
            description: 'Stripe webhook endpoint',
            tags: ['billing'],
            headers: {
                type: 'object',
                properties: {
                    'stripe-signature': { type: 'string' }
                }
            }
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);

        // Forward the webhook with body and stripe-signature header
        const data = await billingService().post(
            '/webhooks/stripe',
            request.body,
            correlationId,
            {
                'stripe-signature': request.headers['stripe-signature'] as string,
            }
        );
        return reply.send(data);
    });

    // Get billing plans
    app.get('/api/billing/plans', {
        schema: {
            description: 'Get billing plans',
            tags: ['billing'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        const data = await billingService().get('/plans', undefined, correlationId);
        return reply.send(data);
    });

    // Get plan by ID
    app.get('/api/billing/plans/:id', {
        schema: {
            description: 'Get plan by ID',
            tags: ['billing'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { id } = request.params as { id: string };
        const correlationId = getCorrelationId(request);
        const data = await billingService().get(`/plans/${id}`, undefined, correlationId);
        return reply.send(data);
    });

    // Legacy: List plans (for backwards compatibility)
    app.get('/api/plans', {
        schema: {
            description: 'List billing plans (legacy)',
            tags: ['billing'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const data = await billingService().get('/plans');
        return reply.send(data);
    });

    // Get subscription by recruiter ID
    app.get('/api/billing/subscriptions/recruiter/:recruiterId', {
        preHandler: requireRoles(['recruiter', 'platform_admin']),
        schema: {
            description: 'Get subscription by recruiter ID',
            tags: ['billing'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { recruiterId } = request.params as { recruiterId: string };
        const correlationId = getCorrelationId(request);
        const data = await billingService().get(`/subscriptions/recruiter/${recruiterId}`, undefined, correlationId);
        return reply.send(data);
    });

    // Get subscription status
    app.get('/api/billing/subscriptions/recruiter/:recruiterId/status', {
        preHandler: requireRoles(['recruiter', 'platform_admin']),
        schema: {
            description: 'Get subscription status',
            tags: ['billing'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { recruiterId } = request.params as { recruiterId: string };
        const correlationId = getCorrelationId(request);
        const data = await billingService().get(`/subscriptions/recruiter/${recruiterId}/status`, undefined, correlationId);
        return reply.send(data);
    });

    // Legacy: Get subscription (for backwards compatibility)
    app.get('/api/subscriptions/recruiter/:recruiterId', {
        schema: {
            description: 'Get subscription by recruiter ID (legacy)',
            tags: ['billing'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { recruiterId } = request.params as { recruiterId: string };
        const data = await billingService().get(`/subscriptions/recruiter/${recruiterId}`);
        return reply.send(data);
    });

    // Create subscription
    app.post('/api/billing/subscriptions', {
        preHandler: requireRoles(['recruiter', 'platform_admin']),
        schema: {
            description: 'Create subscription',
            tags: ['billing'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const correlationId = getCorrelationId(request);
        const data = await billingService().post('/subscriptions', request.body, correlationId);
        return reply.status(201).send(data);
    });

    // Legacy: Create subscription (for backwards compatibility)
    app.post('/api/subscriptions', {
        preHandler: requireRoles(['recruiter']),
        schema: {
            description: 'Create subscription (legacy)',
            tags: ['billing'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const data = await billingService().post('/subscriptions', request.body);
        return reply.send(data);
    });

    // Cancel subscription
    app.post('/api/billing/subscriptions/:recruiterId/cancel', {
        preHandler: requireRoles(['recruiter', 'platform_admin']),
        schema: {
            description: 'Cancel subscription',
            tags: ['billing'],
            security: [{ clerkAuth: [] }],
        },
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { recruiterId } = request.params as { recruiterId: string };
        const correlationId = getCorrelationId(request);
        const data = await billingService().post(`/subscriptions/${recruiterId}/cancel`, undefined, correlationId);
        return reply.send(data);
    });
}
