import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { MatchService } from './service.js';
import { MatchRepository } from './repository.js';
import { requireUserContext, validatePaginationParams } from '../shared/helpers.js';
import { IEventPublisher } from '../shared/events.js';
import { MatchingOrchestrator } from './matching-orchestrator.js';

interface Config {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: IEventPublisher;
    orchestrator: MatchingOrchestrator;
}

export async function registerMatchRoutes(app: FastifyInstance, config: Config) {
    const repository = new MatchRepository(config.supabaseUrl, config.supabaseKey);
    const supabaseClient = createClient(config.supabaseUrl, config.supabaseKey);
    const service = new MatchService(
        repository,
        supabaseClient,
        config.orchestrator,
        config.eventPublisher,
    );

    // GET /api/v2/matches — list matches (filtered by role)
    app.get('/api/v2/matches', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as Record<string, any>;
            const pagination = validatePaginationParams(query);
            const result = await service.listMatches(clerkUserId, {
                ...pagination,
                candidate_id: query.candidate_id,
                job_id: query.job_id,
                match_tier: query.match_tier,
                status: query.status || 'active',
                min_score: query.min_score ? Number(query.min_score) : undefined,
            });
            return reply.send(result);
        } catch (error: any) {
            return reply.code(error.message === 'Authentication required' ? 401 : 400)
                .send({ error: { message: error.message } });
        }
    });

    // GET /api/v2/matches/:id — get single match
    app.get('/api/v2/matches/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const match = await service.getMatch(clerkUserId, id);
            return reply.send({ data: match });
        } catch (error: any) {
            const code = error.message === 'Match not found' ? 404
                : error.message === 'Access denied' ? 403 : 400;
            return reply.code(code).send({ error: { message: error.message } });
        }
    });

    // PATCH /api/v2/matches/:id/dismiss — dismiss a match
    app.patch('/api/v2/matches/:id/dismiss', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const match = await service.dismissMatch(clerkUserId, id);
            return reply.send({ data: match });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    // POST /api/v2/matches/:id/invite — invite candidate to apply
    app.post('/api/v2/matches/:id/invite', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const result = await service.inviteCandidate(clerkUserId, id);
            return reply.send({ data: result });
        } catch (error: any) {
            const code = error.message === 'Candidate already invited for this match' ? 409
                : error.message.includes('Not authorized') ? 403 : 400;
            return reply.code(code).send({ error: { message: error.message } });
        }
    });

    // PATCH /api/v2/matches/:id/deny-invite — deny an invite
    app.patch('/api/v2/matches/:id/deny-invite', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const match = await service.denyInvite(clerkUserId, id);
            return reply.send({ data: match });
        } catch (error: any) {
            const code = error.message.includes('Not authorized') ? 403
                : error.message === 'No pending invite' ? 409 : 400;
            return reply.code(code).send({ error: { message: error.message } });
        }
    });

    // POST /api/v2/matches/refresh — admin: trigger refresh for entity
    app.post('/api/v2/matches/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as { entity_type: 'candidate' | 'job'; entity_id: string };
            const result = await service.refreshForEntity(clerkUserId, body.entity_type, body.entity_id);
            return reply.send({ data: result });
        } catch (error: any) {
            const code = error.message === 'Admin access required' ? 403 : 400;
            return reply.code(code).send({ error: { message: error.message } });
        }
    });

    // POST /api/v2/matches/batch-refresh — internal: nightly catch-up
    app.post('/api/v2/matches/batch-refresh', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const key = request.headers['x-internal-service-key'] as string;
            const body = (request.body as any) || {};
            const result = await service.batchRefresh(key, body.limit);
            return reply.send({ data: result });
        } catch (error: any) {
            return reply.code(403).send({ error: { message: error.message } });
        }
    });
}
