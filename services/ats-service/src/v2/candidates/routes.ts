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
    app.get('/api/v2/candidates', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const filters = request.query as any;
            const result = await config.candidateService.getCandidates(clerkUserId, filters);
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get('/api/v2/candidates/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as any;
            // Try to get user context for enrichment, but don't require it (allow admins/guests)
            let clerkUserId: string | undefined;
            try {
                const userContext = requireUserContext(request);
                clerkUserId = userContext.clerkUserId;
            } catch {
                // No user context available (guest/admin access)
                clerkUserId = undefined;
            }
            const candidate = await config.candidateService.getCandidate(id, clerkUserId);
            return reply.send({ data: candidate });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message } });
        }
    });

    app.post('/api/v2/candidates', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const candidate = await config.candidateService.createCandidate(request.body as any, clerkUserId);
            return reply.code(201).send({ data: candidate });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.patch('/api/v2/candidates/:id', async (request: FastifyRequest, reply: FastifyReply) => {
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
            console.error('PATCH /api/v2/candidates/:id ERROR:', error.message, error.stack);
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.delete('/api/v2/candidates/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            await config.candidateService.deleteCandidate(id, clerkUserId);
            return reply.send({ data: { message: 'Candidate deleted successfully' } });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get('/api/v2/candidate-dashboard/stats', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const stats = await config.candidateService.getCandidateDashboardStats(clerkUserId);
            return reply.send({ data: stats });
        } catch (error: any) {
            return reply
                .code(400)
                .send({ error: { message: error.message || 'Failed to load dashboard stats' } });
        }
    });

    app.get(
        '/v2/candidate-dashboard/recent-applications',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { clerkUserId } = requireUserContext(request);
                const { limit } = request.query as { limit?: string };
                const parsedLimit = limit ? parseInt(limit, 10) : undefined;
                const normalizedLimit =
                    parsedLimit && Number.isFinite(parsedLimit) ? Math.max(1, Math.min(parsedLimit, 25)) : 5;
                const applications = await config.candidateService.getCandidateRecentApplications(
                    clerkUserId,
                    normalizedLimit
                );
                return reply.send({ data: applications });
            } catch (error: any) {
                return reply
                    .code(400)
                    .send({ error: { message: error.message || 'Failed to load recent applications' } });
            }
        }
    );
}
