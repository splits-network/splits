import { FastifyInstance } from 'fastify';
import { requireUserContext } from '../shared/helpers';
import { StripeConnectService } from './service';
import {
    StripeConnectLinkRequest,
    UpdateAccountDetailsRequest,
    AddBankAccountRequest,
} from './types';

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

    // Update account details (personal info + address)
    app.patch(`${basePath}/account`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as UpdateAccountDetailsRequest;
            const status = await service.updateAccountDetails(clerkUserId, body);
            return reply.send({ data: status });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // Add bank account
    app.post(`${basePath}/bank-account`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as AddBankAccountRequest;
            const status = await service.addExternalAccount(clerkUserId, body);
            return reply.send({ data: status });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // Accept Terms of Service
    app.post(`${basePath}/accept-tos`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const ip = request.ip || request.headers['x-forwarded-for'] as string || '0.0.0.0';
            const status = await service.acceptTermsOfService(clerkUserId, ip);
            return reply.send({ data: status });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // Create identity verification session
    app.post(`${basePath}/verification-session`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const session = await service.createVerificationSession(clerkUserId);
            return reply.send({ data: session });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // List recent payouts
    app.get(`${basePath}/payouts`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as { limit?: string };
            const limit = Math.min(parseInt(query.limit || '10', 10), 50);
            const result = await service.listPayouts(clerkUserId, limit);
            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // Create onboarding link (Express account fallback)
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
