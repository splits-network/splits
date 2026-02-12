import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { JobServiceV2 } from './service';
import { JobUpdate } from './types';
import { getUserContext, requireUserContext } from '../shared/helpers';

interface RegisterJobRoutesConfig {
    jobService: JobServiceV2;
}

export function registerJobRoutes(
    app: FastifyInstance,
    config: RegisterJobRoutesConfig
) {
    app.get('/api/v2/jobs', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const context = getUserContext(request);
            const filters = request.query as any;
            const result = await config.jobService.getJobs(context?.clerkUserId, filters);
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            console.error('[V2 Jobs Route] Error:', error);
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get('/api/v2/jobs/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as any;
            const context = getUserContext(request);
            const query = request.query as any;
            const include = query.include ? query.include.split(',') : [];
            const job = await config.jobService.getJob(id, context?.clerkUserId, include);
            return reply.send({ data: job });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message } });
        }
    });

    app.post('/api/v2/jobs', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const job = await config.jobService.createJob(request.body as any, clerkUserId);
            return reply.code(201).send({ data: job });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.patch('/api/v2/jobs/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            const userRole = request.headers['x-user-role'] as string;
            const job = await config.jobService.updateJob(
                id,
                request.body as JobUpdate,
                clerkUserId,
                userRole
            );
            return reply.send({ data: job });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // Termination-related routes

    /**
     * GET /api/v2/jobs/affected-by-termination
     * Returns active jobs affected by a recruiter-company relationship termination
     */
    app.get('/api/v2/jobs/affected-by-termination', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as { recruiter_id?: string; company_id?: string };

            if (!query.recruiter_id || !query.company_id) {
                return reply.code(400).send({ error: { message: 'recruiter_id and company_id are required' } });
            }

            const jobs = await config.jobService.getAffectedByTermination(
                query.recruiter_id,
                query.company_id
            );
            return reply.send({ data: jobs });
        } catch (error: any) {
            return reply.code(500).send({ error: { message: error.message } });
        }
    });

    /**
     * POST /api/v2/jobs/termination-decisions
     * Process per-job decisions when terminating a recruiter-company relationship
     */
    app.post('/api/v2/jobs/termination-decisions', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as {
                recruiter_id: string;
                decisions: { job_id: string; action: 'keep' | 'pause' | 'close' }[];
            };

            if (!body.decisions || !Array.isArray(body.decisions) || !body.recruiter_id) {
                return reply.code(400).send({ error: { message: 'recruiter_id and decisions array are required' } });
            }

            await config.jobService.processCompanyTerminationDecisions(body.decisions, body.recruiter_id);
            return reply.send({ data: { message: 'Termination decisions processed' } });
        } catch (error: any) {
            return reply.code(500).send({ error: { message: error.message } });
        }
    });

    app.delete('/api/v2/jobs/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            await config.jobService.deleteJob(id, clerkUserId);
            return reply.send({ data: { message: 'Job deleted successfully' } });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });
}
