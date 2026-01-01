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
            console.log('Jobs result:', result);
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get('/api/v2/jobs/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as any;
            const context = getUserContext(request);
            const job = await config.jobService.getJob(id, context?.clerkUserId);
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
