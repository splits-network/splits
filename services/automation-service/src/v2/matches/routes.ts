import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CandidateMatchServiceV2 } from './service';
import { CandidateMatchRepository, CreateMatchInput } from './repository';
import { MatchFilters, MatchUpdate } from './types';
import { requireUserContext, validatePaginationParams } from '../shared/helpers';
import { EventPublisher } from '../shared/events';

interface RegisterMatchRoutesConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: EventPublisher;
}

export async function registerMatchRoutes(
    app: FastifyInstance,
    config: RegisterMatchRoutesConfig
) {
    const repository = new CandidateMatchRepository(config.supabaseUrl, config.supabaseKey);
    const service = new CandidateMatchServiceV2(repository, config.eventPublisher);

    app.get('/v2/matches', async (request, reply) => {
        try {
            requireUserContext(request);
            const query = request.query as Record<string, any>;
            const pagination = validatePaginationParams(query);
            const filters: MatchFilters = {
                candidate_id: query.candidate_id,
                job_id: query.job_id,
                status: query.status,
                min_score: query.min_score ? Number(query.min_score) : undefined,
                page: pagination.page,
                limit: pagination.limit,
            };
            const result = await service.listMatches(filters);
            return reply.send(result);
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to fetch matches' } });
        }
    });

    app.get('/v2/matches/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            const match = await service.getMatch(id);
            return reply.send({ data: match });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message || 'Match not found' } });
        }
    });

    app.post('/v2/matches', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const body = request.body as CreateMatchInput;
            if (!body?.candidate_id || !body.job_id || typeof body.match_score === 'undefined' || !body.match_reason) {
                return reply.code(400).send({
                    error: { message: 'candidate_id, job_id, match_score, and match_reason are required' },
                });
            }
            const match = await service.createMatch(body);
            return reply.code(201).send({ data: match });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to create match' } });
        }
    });

    app.patch('/v2/matches/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as MatchUpdate;
            const match = await service.updateMatch(id, updates);
            return reply.send({ data: match });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to update match' } });
        }
    });

    app.delete('/v2/matches/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            await service.deleteMatch(id);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message || 'Failed to delete match' } });
        }
    });
}
