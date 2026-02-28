import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AdminIdentityService } from './service';

interface AdminIdentityRoutesConfig {
    adminService: AdminIdentityService;
}

export function registerAdminIdentityRoutes(
    app: FastifyInstance,
    config: AdminIdentityRoutesConfig
) {
    const { adminService } = config;

    // GET /admin/users
    app.get('/admin/users', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const params = request.query as any;
            const result = await adminService.listUsersAdmin({
                page: params.page ? parseInt(params.page, 10) : 1,
                limit: params.limit ? parseInt(params.limit, 10) : 25,
                search: params.search,
                sort_by: params.sort_by,
                sort_order: params.sort_order,
            });
            reply.send(result);
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to list users' } });
        }
    });

    // GET /admin/users/:id
    app.get('/admin/users/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const user = await adminService.getUserAdmin(id);
            reply.send({ data: user });
        } catch (error) {
            const msg = (error as Error).message || '';
            if (msg.includes('not found') || (error as any)?.code === 'PGRST116') {
                reply.code(404).send({ error: { message: 'User not found' } });
            } else {
                reply.code(500).send({ error: { message: 'Failed to fetch user' } });
            }
        }
    });

    // GET /admin/organizations
    app.get('/admin/organizations', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const params = request.query as any;
            const result = await adminService.listOrganizationsAdmin({
                page: params.page ? parseInt(params.page, 10) : 1,
                limit: params.limit ? parseInt(params.limit, 10) : 25,
                search: params.search,
                sort_by: params.sort_by,
                sort_order: params.sort_order,
                status: params.status,
            });
            reply.send(result);
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to list organizations' } });
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

    // GET /admin/activity
    app.get('/admin/activity', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const params = request.query as { scope?: string; limit?: string };
            const activities = await adminService.getAdminActivity({
                scope: params.scope,
                limit: params.limit ? parseInt(params.limit, 10) : 20,
            });
            reply.send({ data: activities });
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to fetch activity' } });
        }
    });
}
