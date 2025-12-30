import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ApplicationServiceV2 } from './service';
import { ApplicationUpdate } from './types';
import { requireUserContext } from '../shared/helpers';

interface RegisterApplicationRoutesConfig {
    applicationService: ApplicationServiceV2;
}

export function registerApplicationRoutes(
    app: FastifyInstance,
    config: RegisterApplicationRoutesConfig
) {
    app.get('/v2/applications', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const filters = request.query as any;
            const result = await config.applicationService.getApplications(clerkUserId, filters);
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get('/v2/applications/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as any;
            const application = await config.applicationService.getApplication(id);
            return reply.send({ data: application });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message } });
        }
    });

    app.post('/v2/applications', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const application = await config.applicationService.createApplication(request.body as any, clerkUserId);
            return reply.code(201).send({ data: application });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.patch('/v2/applications/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            const updates = request.body as ApplicationUpdate;
            const application = await config.applicationService.updateApplication(id, updates, clerkUserId);
            return reply.send({ data: application });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.delete('/v2/applications/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            await config.applicationService.deleteApplication(id, clerkUserId);
            return reply.send({ data: { message: 'Application deleted successfully' } });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });
}
