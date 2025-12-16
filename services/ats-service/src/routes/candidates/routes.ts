import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AtsService } from '../../service';

export function registerCandidateRoutes(app: FastifyInstance, service: AtsService) {
    // Get all candidates with optional filters
    app.get(
        '/candidates',
        async (request: FastifyRequest<{ Querystring: { search?: string; limit?: string; offset?: string } }>, reply: FastifyReply) => {
            const { search, limit, offset } = request.query;
            const candidates = await service.getCandidates({
                search,
                limit: limit ? parseInt(limit) : undefined,
                offset: offset ? parseInt(offset) : undefined,
            });
            return reply.send({ data: candidates });
        }
    );

    // Get candidate by ID
    app.get(
        '/candidates/:id',
        async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            const candidate = await service.getCandidateById(request.params.id);
            return reply.send({ data: candidate });
        }
    );

    // Get applications for a candidate
    app.get(
        '/candidates/:id/applications',
        async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            const applications = await service.getApplicationsByCandidateId(request.params.id);
            return reply.send({ data: applications });
        }
    );
}
