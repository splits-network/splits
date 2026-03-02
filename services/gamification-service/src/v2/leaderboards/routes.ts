import { FastifyInstance } from 'fastify';
import { LeaderboardService } from './service';
import { validatePaginationParams } from '../shared/pagination';
import { BadgeEntityType } from '../badges/definitions/types';
import { LeaderboardPeriod } from './types';

export function registerLeaderboardRoutes(
    app: FastifyInstance,
    config: { leaderboardService: LeaderboardService }
) {
    // Get leaderboard
    app.get('/api/v2/leaderboards', async (request, reply) => {
        try {
            const query = request.query as any;
            if (!query.entity_type || !query.period || !query.metric) {
                return reply.code(400).send({
                    error: 'entity_type, period, and metric are required',
                });
            }
            const pagination = validatePaginationParams(query.page, query.limit);
            const result = await config.leaderboardService.getLeaderboard({
                entity_type: query.entity_type as BadgeEntityType,
                period: query.period as LeaderboardPeriod,
                metric: query.metric,
                period_start: query.period_start,
                ...pagination,
            });
            return reply.send(result);
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message });
        }
    });

    // Get entity rank
    app.get('/api/v2/leaderboards/rank', async (request, reply) => {
        try {
            const query = request.query as any;
            if (!query.entity_type || !query.entity_id || !query.period || !query.metric) {
                return reply.code(400).send({
                    error: 'entity_type, entity_id, period, and metric are required',
                });
            }
            const data = await config.leaderboardService.getEntityRank(
                query.entity_type as BadgeEntityType,
                query.entity_id,
                query.period as LeaderboardPeriod,
                query.metric
            );
            return reply.send({ data });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message });
        }
    });
}
