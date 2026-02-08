import { FastifyInstance } from 'fastify';
import { requireUserContext } from '../shared/helpers';
import { CompanyBillingProfileService } from './service';
import { CompanyBillingProfileCreate, CompanyBillingProfileUpdate } from './types';

export function companyBillingProfileRoutes(
    app: FastifyInstance,
    service: CompanyBillingProfileService
) {
    const basePath = '/api/v2/company-billing-profiles';

    app.get(basePath, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { page, limit } = request.query as { page?: string; limit?: string };
            const result = await service.list(
                clerkUserId,
                page ? parseInt(page, 10) : 1,
                limit ? parseInt(limit, 10) : 25
            );
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get(`${basePath}/:companyId`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { companyId } = request.params as { companyId: string };
            const profile = await service.getByCompanyId(companyId, clerkUserId);
            return reply.send({ data: profile });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.post(`${basePath}/:companyId`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { companyId } = request.params as { companyId: string };
            const payload = request.body as CompanyBillingProfileCreate;
            const profile = await service.upsert(companyId, payload, clerkUserId);
            return reply.send({ data: profile });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.patch(`${basePath}/:companyId`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { companyId } = request.params as { companyId: string };
            const updates = request.body as CompanyBillingProfileUpdate;
            const profile = await service.update(companyId, updates, clerkUserId);
            return reply.send({ data: profile });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.post(`${basePath}/:companyId/setup-intent`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { companyId } = request.params as { companyId: string };
            const result = await service.createSetupIntent(companyId, clerkUserId);
            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get(`${basePath}/:companyId/payment-method`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { companyId } = request.params as { companyId: string };
            const result = await service.getPaymentMethod(companyId, clerkUserId);
            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.post(`${basePath}/:companyId/payment-method`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { companyId } = request.params as { companyId: string };
            const { payment_method_id } = request.body as { payment_method_id: string };
            const result = await service.updatePaymentMethod(companyId, payment_method_id, clerkUserId);
            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get(`${basePath}/:companyId/billing-readiness`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { companyId } = request.params as { companyId: string };
            const result = await service.getBillingReadiness(companyId, clerkUserId);
            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });
}
