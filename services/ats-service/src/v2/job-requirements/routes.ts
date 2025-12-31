import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { JobRequirementService } from './service';
import { requireUserContext } from '../shared/helpers';

interface RegisterJobRequirementRoutesConfig {
    service: JobRequirementService;
}

export function registerJobRequirementRoutes(
    app: FastifyInstance,
    config: RegisterJobRequirementRoutesConfig
) {
    app.get('/api/v2/job-requirements', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { job_id } = request.query as { job_id?: string };
            const data = await config.service.listRequirements(job_id);
            return reply.send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to load job requirements' } });
        }
    });

    app.get('/api/v2/job-requirements/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { id } = request.params;
            const data = await config.service.getRequirement(id);
            return reply.send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 404)
                .send({ error: { message: error.message || 'Requirement not found' } });
        }
    });

    app.post('/api/v2/job-requirements', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const data = await config.service.createRequirement(request.body);
            return reply.code(201).send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to create requirement' } });
        }
    });

    app.patch('/api/v2/job-requirements/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { id } = request.params;
            const data = await config.service.updateRequirement(id, request.body);
            return reply.send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to update requirement' } });
        }
    });

    app.delete('/api/v2/job-requirements/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { id } = request.params;
            await config.service.deleteRequirement(id);
            return reply.code(204).send();
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to delete requirement' } });
        }
    });
}
