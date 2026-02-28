import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AdminBillingService } from './service';

interface AdminBillingRoutesConfig {
    adminService: AdminBillingService;
}

export function registerAdminBillingRoutes(
    app: FastifyInstance,
    config: AdminBillingRoutesConfig
) {
    const { adminService } = config;

    // GET /admin/payouts
    app.get('/admin/payouts', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const params = request.query as any;
            const result = await adminService.listPayoutsAdmin({
                page: params.page ? parseInt(params.page, 10) : 1,
                limit: params.limit ? parseInt(params.limit, 10) : 25,
                search: params.search,
                sort_by: params.sort_by,
                sort_order: params.sort_order,
                status: params.status,
            });
            reply.send(result);
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to list payouts' } });
        }
    });

    // GET /admin/escrow
    app.get('/admin/escrow', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const params = request.query as any;
            const result = await adminService.listEscrowHoldsAdmin({
                page: params.page ? parseInt(params.page, 10) : 1,
                limit: params.limit ? parseInt(params.limit, 10) : 25,
                search: params.search,
                sort_by: params.sort_by,
                sort_order: params.sort_order,
                status: params.status,
            });
            reply.send(result);
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to list escrow holds' } });
        }
    });

    // GET /admin/billing-profiles
    app.get('/admin/billing-profiles', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const params = request.query as any;
            const result = await adminService.listBillingProfilesAdmin({
                page: params.page ? parseInt(params.page, 10) : 1,
                limit: params.limit ? parseInt(params.limit, 10) : 25,
                search: params.search,
                sort_by: params.sort_by,
                sort_order: params.sort_order,
            });
            reply.send(result);
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to list billing profiles' } });
        }
    });

    // POST /admin/escrow/:id/release
    app.post('/admin/escrow/:id/release', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const result = await adminService.releaseEscrowHold(id);
            reply.send({ data: result });
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to release escrow hold' } });
        }
    });

    // GET /admin/counts
    app.get('/admin/counts', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const counts = await adminService.getAdminCounts();
            reply.send({ data: counts });
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to fetch counts' } });
        }
    });
}
