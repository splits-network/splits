import { FastifyInstance } from 'fastify';
import { StreakService } from './service';
import { BadgeEntityType } from '../badges/definitions/types';

export function registerStreakRoutes(
    app: FastifyInstance,
    config: { streakService: StreakService }
) {
    app.get('/api/v2/streaks', async (request, reply) => {
        try {
            const query = request.query as any;
            if (!query.entity_type || !query.entity_id) {
                return reply.code(400).send({ error: 'entity_type and entity_id are required' });
            }
            const data = await config.streakService.getByEntity(
                query.entity_type as BadgeEntityType,
                query.entity_id
            );
            return reply.send({ data });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message });
        }
    });
}
