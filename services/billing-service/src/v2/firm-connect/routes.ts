import { FastifyInstance } from 'fastify';
import { requireUserContext } from '../shared/helpers';
import { FirmStripeConnectService } from './service';
import {
    FirmConnectLinkRequest,
    UpdateFirmAccountDetailsRequest,
    AddFirmBankAccountRequest,
} from './types';

export function firmStripeConnectRoutes(app: FastifyInstance, service: FirmStripeConnectService) {
    const basePath = '/api/v2/firm-stripe-connect';

    app.get(`${basePath}/:firmId/account`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { firmId } = request.params as { firmId: string };
            const status = await service.getAccountStatus(firmId, clerkUserId);
            return reply.send({ data: status });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.post(`${basePath}/:firmId/account`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { firmId } = request.params as { firmId: string };
            const status = await service.getOrCreateAccount(firmId, clerkUserId);
            return reply.send({ data: status });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.patch(`${basePath}/:firmId/account`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { firmId } = request.params as { firmId: string };
            const body = request.body as UpdateFirmAccountDetailsRequest;
            const status = await service.updateAccountDetails(firmId, clerkUserId, body);
            return reply.send({ data: status });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.post(`${basePath}/:firmId/bank-account`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { firmId } = request.params as { firmId: string };
            const body = request.body as AddFirmBankAccountRequest;
            const status = await service.addExternalAccount(firmId, clerkUserId, body);
            return reply.send({ data: status });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.post(`${basePath}/:firmId/accept-tos`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { firmId } = request.params as { firmId: string };
            const ip = request.ip || request.headers['x-forwarded-for'] as string || '0.0.0.0';
            const status = await service.acceptTermsOfService(firmId, clerkUserId, ip);
            return reply.send({ data: status });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.post(`${basePath}/:firmId/verification-session`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { firmId } = request.params as { firmId: string };
            const session = await service.createVerificationSession(firmId, clerkUserId);
            return reply.send({ data: session });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get(`${basePath}/:firmId/payouts`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { firmId } = request.params as { firmId: string };
            const query = request.query as { limit?: string };
            const limit = Math.min(parseInt(query.limit || '10', 10), 50);
            const result = await service.listPayouts(firmId, clerkUserId, limit);
            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.post(`${basePath}/:firmId/onboarding-link`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { firmId } = request.params as { firmId: string };
            const body = request.body as FirmConnectLinkRequest;
            const link = await service.createOnboardingLink(firmId, body, clerkUserId);
            return reply.send({ data: link });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });
}
