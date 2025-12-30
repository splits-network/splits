import { FastifyInstance } from 'fastify';
import { EventPublisher } from './shared/events';
import { requireUserContext, validatePaginationParams } from './shared/helpers';
import { PlanRepository } from './plans/repository';
import { PlanServiceV2 } from './plans/service';
import { SubscriptionRepository } from './subscriptions/repository';
import { SubscriptionServiceV2 } from './subscriptions/service';
import { PayoutRepository } from './payouts/repository';
import { PayoutServiceV2 } from './payouts/service';

interface BillingV2Config {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: EventPublisher;
}

export async function registerV2Routes(app: FastifyInstance, config: BillingV2Config) {
    const planRepository = new PlanRepository(config.supabaseUrl, config.supabaseKey);
    const subscriptionRepository = new SubscriptionRepository(config.supabaseUrl, config.supabaseKey);
    const payoutRepository = new PayoutRepository(config.supabaseUrl, config.supabaseKey);

    const planService = new PlanServiceV2(planRepository, config.eventPublisher);
    const subscriptionService = new SubscriptionServiceV2(
        subscriptionRepository,
        planRepository,
        config.eventPublisher
    );
    const payoutService = new PayoutServiceV2(payoutRepository, config.eventPublisher);

    // ============================================
    // PLANS
    // ============================================
    app.get('/v2/plans', async (request, reply) => {
        try {
            const pagination = validatePaginationParams(request.query as Record<string, any>);
            const filters = {
                ...(request.query as Record<string, any>),
                ...pagination,
            };
            const result = await planService.getPlans(filters);
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get('/v2/plans/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const plan = await planService.getPlan(id);
            return reply.send({ data: plan });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message } });
        }
    });

    app.post('/v2/plans', async (request, reply) => {
        try {
            const context = requireUserContext(request);
            const plan = await planService.createPlan(request.body as any, context);
            return reply.code(201).send({ data: plan });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.patch('/v2/plans/:id', async (request, reply) => {
        try {
            const context = requireUserContext(request);
            const { id } = request.params as { id: string };
            const plan = await planService.updatePlan(id, request.body as any, context);
            return reply.send({ data: plan });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.delete('/v2/plans/:id', async (request, reply) => {
        try {
            const context = requireUserContext(request);
            const { id } = request.params as { id: string };
            await planService.deletePlan(id, context);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // ============================================
    // SUBSCRIPTIONS
    // ============================================
    app.get('/v2/subscriptions', async (request, reply) => {
        try {
            const context = requireUserContext(request);
            const pagination = validatePaginationParams(request.query as Record<string, any>);
            const filters = {
                ...(request.query as Record<string, any>),
                ...pagination,
            };
            const result = await subscriptionService.getSubscriptions(filters, context);
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get('/v2/subscriptions/:id', async (request, reply) => {
        try {
            const context = requireUserContext(request);
            const { id } = request.params as { id: string };
            const subscription = await subscriptionService.getSubscription(id, context);
            return reply.send({ data: subscription });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message } });
        }
    });

    app.post('/v2/subscriptions', async (request, reply) => {
        try {
            const context = requireUserContext(request);
            const subscription = await subscriptionService.createSubscription(request.body as any, context);
            return reply.code(201).send({ data: subscription });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.patch('/v2/subscriptions/:id', async (request, reply) => {
        try {
            const context = requireUserContext(request);
            const { id } = request.params as { id: string };
            const subscription = await subscriptionService.updateSubscription(id, request.body as any, context);
            return reply.send({ data: subscription });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.delete('/v2/subscriptions/:id', async (request, reply) => {
        try {
            const context = requireUserContext(request);
            const { id } = request.params as { id: string };
            const subscription = await subscriptionService.cancelSubscription(id, context);
            return reply.send({ data: subscription });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // ============================================
    // PAYOUTS
    // ============================================
    app.get('/v2/payouts', async (request, reply) => {
        try {
            const context = requireUserContext(request);
            const pagination = validatePaginationParams(request.query as Record<string, any>);
            const filters = {
                ...(request.query as Record<string, any>),
                ...pagination,
            };
            const result = await payoutService.getPayouts(filters, context);
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get('/v2/payouts/:id', async (request, reply) => {
        try {
            const context = requireUserContext(request);
            const { id } = request.params as { id: string };
            const payout = await payoutService.getPayout(id, context);
            return reply.send({ data: payout });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message } });
        }
    });

    app.post('/v2/payouts', async (request, reply) => {
        try {
            const context = requireUserContext(request);
            const payout = await payoutService.createPayout(request.body as any, context);
            return reply.code(201).send({ data: payout });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.patch('/v2/payouts/:id', async (request, reply) => {
        try {
            const context = requireUserContext(request);
            const { id } = request.params as { id: string };
            const payout = await payoutService.updatePayout(id, request.body as any, context);
            return reply.send({ data: payout });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.delete('/v2/payouts/:id', async (request, reply) => {
        try {
            const context = requireUserContext(request);
            const { id } = request.params as { id: string };
            await payoutService.deletePayout(id, context);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });
}
