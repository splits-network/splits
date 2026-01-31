import { FastifyInstance } from 'fastify';
import { requireUserContext } from '../shared/helpers';
import { PlacementInvoiceService } from './service';

export function placementInvoiceRoutes(app: FastifyInstance, service: PlacementInvoiceService) {
    const basePath = '/api/v2/placements';
    const companyBasePath = '/api/v2/company-billing-profiles';

    app.get(`${basePath}/:placementId/invoices`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { placementId } = request.params as { placementId: string };
            const invoice = await service.getByPlacementId(placementId, clerkUserId);
            return reply.send({ data: invoice });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.post(`${basePath}/:placementId/invoices`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { placementId } = request.params as { placementId: string };
            const invoice = await service.createForPlacement(placementId, clerkUserId);
            return reply.send({ data: invoice });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get(`${companyBasePath}/:companyId/invoices`, async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { companyId } = request.params as { companyId: string };
            const { page, limit } = request.query as { page?: string; limit?: string };
            const result = await service.listByCompany(
                companyId,
                clerkUserId,
                page ? parseInt(page, 10) : 1,
                limit ? parseInt(limit, 10) : 25
            );
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });
}
