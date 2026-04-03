import { FastifyInstance } from 'fastify';
import { BadgeProgressService } from './service.js';
import { BadgeEntityType } from '../definitions/types.js';

export function registerBadgeProgressRoutes(
    app: FastifyInstance,
    config: { progressService: BadgeProgressService }
) {
    app.get('/api/v2/badges/progress', async (request, reply) => {
        try {
            const query = request.query as any;
            if (!query.entity_type || !query.entity_id) {
                return reply.code(400).send({ error: 'entity_type and entity_id are required' });
            }
            const data = await config.progressService.getByEntity(
                query.entity_type as BadgeEntityType,
                query.entity_id
            );
            return reply.send({ data });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message });
        }
    });

    // ── V3 alias ──

    app.get('/api/v3/badges/progress', async (request, reply) => {
        try {
            const query = request.query as any;
            if (!query.entity_type || !query.entity_id) {
                return reply.code(400).send({ error: 'entity_type and entity_id are required' });
            }
            const data = await config.progressService.getByEntity(
                query.entity_type as BadgeEntityType,
                query.entity_id
            );
            return reply.send({ data });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message });
        }
    });
}
