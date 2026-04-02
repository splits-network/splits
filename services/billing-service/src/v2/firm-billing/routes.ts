import { FastifyInstance } from 'fastify';
import { requireUserContext } from '../shared/helpers.js';
import { FirmBillingProfileService } from './service.js';
import { FirmBillingProfileCreate, FirmBillingProfileUpdate } from './types.js';

export function firmBillingProfileRoutes(
    app: FastifyInstance,
    service: FirmBillingProfileService
) {
    const basePath = '/api/v2/firm-billing-profiles';

    app.get(`${basePath}/:firmId`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { firmId } = request.params as { firmId: string };
            const profile = await service.getByFirmId(firmId, clerkUserId);
            return reply.send({ data: profile });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.post(`${basePath}/:firmId`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { firmId } = request.params as { firmId: string };
            const payload = request.body as FirmBillingProfileCreate;
            const profile = await service.upsert(firmId, payload, clerkUserId);
            return reply.send({ data: profile });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.patch(`${basePath}/:firmId`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { firmId } = request.params as { firmId: string };
            const updates = request.body as FirmBillingProfileUpdate;
            const profile = await service.update(firmId, updates, clerkUserId);
            return reply.send({ data: profile });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.post(`${basePath}/:firmId/setup-intent`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { firmId } = request.params as { firmId: string };
            const result = await service.createSetupIntent(firmId, clerkUserId);
            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get(`${basePath}/:firmId/payment-method`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { firmId } = request.params as { firmId: string };
            const result = await service.getPaymentMethod(firmId, clerkUserId);
            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.post(`${basePath}/:firmId/payment-method`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { firmId } = request.params as { firmId: string };
            const { payment_method_id } = request.body as { payment_method_id: string };
            const result = await service.updatePaymentMethod(firmId, payment_method_id, clerkUserId);
            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get(`${basePath}/:firmId/billing-readiness`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { firmId } = request.params as { firmId: string };
            const result = await service.getBillingReadiness(firmId, clerkUserId);
            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });
}
