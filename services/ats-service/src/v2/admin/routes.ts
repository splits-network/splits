import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AdminAtsService } from './service';

interface AdminAtsRoutesConfig {
    adminService: AdminAtsService;
}

function parseFilters(params: any): Record<string, any> {
    if (!params.filters) return {};
    return typeof params.filters === 'string' ? JSON.parse(params.filters) : params.filters;
}

export function registerAdminAtsRoutes(
    app: FastifyInstance,
    config: AdminAtsRoutesConfig
) {
    const { adminService } = config;

    // GET /admin/jobs
    app.get('/admin/jobs', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const params = request.query as any;
            const filters = parseFilters(params);
            const result = await adminService.listJobsAdmin({
                page: params.page ? parseInt(params.page, 10) : 1,
                limit: params.limit ? parseInt(params.limit, 10) : 25,
                search: params.search || filters.search,
                sort_by: params.sort_by,
                sort_order: params.sort_order,
                status: params.status || filters.status,
                commute_type: params.commute_type || filters.commute_type,
                job_level: params.job_level || filters.job_level,
            });
            reply.send(result);
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to list jobs' } });
        }
    });

    // GET /admin/jobs/:id
    app.get('/admin/jobs/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const job = await adminService.getJobAdmin(id);
            reply.send({ data: job });
        } catch (error) {
            const code = (error as any)?.code;
            if (code === 'PGRST116') {
                reply.code(404).send({ error: { message: 'Job not found' } });
            } else {
                reply.code(500).send({ error: { message: 'Failed to fetch job' } });
            }
        }
    });

    // PATCH /admin/jobs/:id/status
    app.patch('/admin/jobs/:id/status', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as { id: string };
            const { status } = request.body as { status: string };

            if (!status) {
                return reply.code(400).send({ error: { message: 'status is required' } });
            }

            const job = await adminService.updateJobStatusAdmin(id, status);
            reply.send({ data: job });
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to update job status' } });
        }
    });

    // GET /admin/job-counts-by-status
    app.get('/admin/job-counts-by-status', async (_request: FastifyRequest, reply: FastifyReply) => {
        try {
            const counts = await adminService.getJobCountsByStatus();
            reply.send({ data: counts });
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to fetch job counts' } });
        }
    });

    // GET /admin/applications
    app.get('/admin/applications', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const params = request.query as any;
            const filters = parseFilters(params);
            const result = await adminService.listApplicationsAdmin({
                page: params.page ? parseInt(params.page, 10) : 1,
                limit: params.limit ? parseInt(params.limit, 10) : 25,
                search: params.search || filters.search,
                sort_by: params.sort_by,
                sort_order: params.sort_order,
                stage: params.stage || filters.stage,
            });
            reply.send(result);
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to list applications' } });
        }
    });

    // GET /admin/candidates
    app.get('/admin/candidates', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const params = request.query as any;
            const filters = parseFilters(params);
            const result = await adminService.listCandidatesAdmin({
                page: params.page ? parseInt(params.page, 10) : 1,
                limit: params.limit ? parseInt(params.limit, 10) : 25,
                search: params.search || filters.search,
                sort_by: params.sort_by,
                sort_order: params.sort_order,
            });
            reply.send(result);
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to list candidates' } });
        }
    });

    // GET /admin/assignments
    app.get('/admin/assignments', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const params = request.query as any;
            const filters = parseFilters(params);
            const result = await adminService.listAssignmentsAdmin({
                page: params.page ? parseInt(params.page, 10) : 1,
                limit: params.limit ? parseInt(params.limit, 10) : 25,
                search: params.search || filters.search,
                sort_by: params.sort_by,
                sort_order: params.sort_order,
            });
            reply.send(result);
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to list assignments' } });
        }
    });

    // GET /admin/placements
    app.get('/admin/placements', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const params = request.query as any;
            const filters = parseFilters(params);
            const result = await adminService.listPlacementsAdmin({
                page: params.page ? parseInt(params.page, 10) : 1,
                limit: params.limit ? parseInt(params.limit, 10) : 25,
                search: params.search || filters.search,
                sort_by: params.sort_by,
                sort_order: params.sort_order,
                state: params.state || filters.status,
            });
            reply.send(result);
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to list placements' } });
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

    // GET /admin/chart-data?period=30d
    app.get('/admin/chart-data', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { period } = request.query as { period?: string };
            const chartData = await adminService.getAdminChartData(period || '30d');
            reply.send({ data: chartData });
        } catch (error) {
            reply.code(500).send({ error: { message: 'Failed to fetch chart data' } });
        }
    });
}
