import { FastifyInstance } from 'fastify';
import { requireUserContext } from '../shared/helpers';
import { StripeConnectService } from './service';
import { StripeConnectLinkRequest } from './types';

export function stripeConnectRoutes(app: FastifyInstance, service: StripeConnectService) {
    const basePath = '/api/v2/stripe/connect';

    // Get current connect account status
    app.get(`${basePath}/account`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const status = await service.getAccountStatus(clerkUserId);
            return reply.send({ data: status });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // Create or fetch Stripe Connect account
    app.post(`${basePath}/account`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const status = await service.getOrCreateAccount(clerkUserId);
            return reply.send({ data: status });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // Create account session for embedded components
    app.post(`${basePath}/account-session`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const session = await service.createAccountSession(clerkUserId);
            return reply.send({ data: session });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // Create Express Dashboard login link
    app.post(`${basePath}/dashboard-link`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const link = await service.createDashboardLink(clerkUserId);
            return reply.send({ data: link });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // Create onboarding link
    app.post(`${basePath}/onboarding-link`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as StripeConnectLinkRequest;
            const link = await service.createOnboardingLink(clerkUserId, body);
            return reply.send({ data: link });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });
}
