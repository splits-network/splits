import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CandidateServiceV2 } from './service';
import { CandidateUpdate } from './types';
import { requireUserContext } from '../shared/helpers';

interface RegisterCandidateRoutesConfig {
    candidateService: CandidateServiceV2;
}

export function registerCandidateRoutes(
    app: FastifyInstance,
    config: RegisterCandidateRoutesConfig
) {
    app.get('/v2/candidates', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const filters = request.query as any;
            const result = await config.candidateService.getCandidates(clerkUserId, filters);
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get('/v2/candidates/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as any;
            const candidate = await config.candidateService.getCandidate(id);
            return reply.send({ data: candidate });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message } });
        }
    });

    app.post('/v2/candidates', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const candidate = await config.candidateService.createCandidate(request.body as any, clerkUserId);
            return reply.code(201).send({ data: candidate });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.patch('/v2/candidates/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            const candidate = await config.candidateService.updateCandidate(
                id,
                request.body as CandidateUpdate,
                clerkUserId
            );
            return reply.send({ data: candidate });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.delete('/v2/candidates/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            await config.candidateService.deleteCandidate(id, clerkUserId);
            return reply.send({ data: { message: 'Candidate deleted successfully' } });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });
}
