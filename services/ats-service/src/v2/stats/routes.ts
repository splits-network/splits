import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { requireUserContext } from '../shared/helpers';
import { StatsServiceV2 } from './service';
import { StatsQueryParams } from './types';

interface RegisterStatsRoutesConfig {
    statsService: StatsServiceV2;
}

export function registerStatsRoutes(app: FastifyInstance, config: RegisterStatsRoutesConfig) {
    app.get(
        '/api/v2/stats',
        async (request: FastifyRequest<{ Querystring: StatsQueryParams }>, reply: FastifyReply) => {
            try {
                const { clerkUserId } = requireUserContext(request);
                const stats = await config.statsService.getStats(clerkUserId, request.query || {});
                return reply.send({ data: stats });
            } catch (error: any) {
                return reply
                    .code(error?.message?.includes('required') ? 403 : 400)
                    .send({ error: { message: error?.message || 'Failed to load stats' } });
            }
        }
    );
}
