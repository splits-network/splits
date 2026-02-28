import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AdminNetworkService } from './service';

interface AdminNetworkRoutesConfig {
    adminService: AdminNetworkService;
}

export function registerAdminNetworkRoutes(
    app: FastifyInstance,
    config: AdminNetworkRoutesConfig
) {
    const { adminService } = config;

    // GET /admin/recruiters
    app.get('/admin/recruiters', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const params = request.query as any;
            const result = await adminService.listRecruitersAdmin({
                page: params.page ? parseInt(params.page, 10) : 1,
                limit: params.limit ? parseInt(params.limit, 10) : 25,
                search: params.search,
                sort_by: params.sort_by,
                sort_order: params.sort_order,
                status: params.status,
            });
            reply.send(result);
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to list recruiters' } });
        }
    });

    // PATCH /admin/recruiters/:id/status
    app.patch('/admin/recruiters/:id/status', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const { status } = request.body as { status: string };

            if (!status) {
                return reply.code(400).send({ error: { message: 'status is required' } });
            }

            const recruiter = await adminService.updateRecruiterStatusAdmin(id, status);
            reply.send({ data: recruiter });
        } catch (error) {
            const code = (error as any)?.code;
            if (code === 'PGRST116') {
                reply.code(404).send({ error: { message: 'Recruiter not found' } });
            } else {
                reply.code(500).send({ error: { message: 'Failed to update recruiter status' } });
            }
        }
    });

    // GET /admin/recruiter-companies
    app.get('/admin/recruiter-companies', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const params = request.query as any;
            const result = await adminService.listRecruiterCompaniesAdmin({
                page: params.page ? parseInt(params.page, 10) : 1,
                limit: params.limit ? parseInt(params.limit, 10) : 25,
                search: params.search,
                sort_by: params.sort_by,
                sort_order: params.sort_order,
                status: params.status,
            });
            reply.send(result);
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to list recruiter-companies' } });
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

    // GET /admin/stats?period=30d
    app.get('/admin/stats', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { period } = request.query as { period?: string };
            const stats = await adminService.getAdminStats(period || '30d');
            reply.send({ data: stats });
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to fetch admin stats' } });
        }
    });
}
