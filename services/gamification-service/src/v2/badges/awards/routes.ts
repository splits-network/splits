import { FastifyInstance } from 'fastify';
import { BadgeAwardService } from './service';
import { getOptionalUserContext } from '../../shared/helpers';
import { validatePaginationParams } from '../../shared/pagination';
import { BadgeEntityType } from '../definitions/types';

export function registerBadgeAwardRoutes(
    app: FastifyInstance,
    config: { awardService: BadgeAwardService }
) {
    // Public: get badges for an entity
    app.get('/api/v2/badges/awards', async (request, reply) => {
        try {
            const query = request.query as any;

            if (query.entity_type && query.entity_id) {
                const awards = await config.awardService.getByEntity(
                    query.entity_type as BadgeEntityType,
                    query.entity_id,
                    query.include_revoked === 'true'
                );
                return reply.send({ data: awards });
            }

            const pagination = validatePaginationParams(query.page, query.limit);
            const result = await config.awardService.list({
                ...pagination,
                entity_type: query.entity_type,
                entity_id: query.entity_id,
                include_revoked: query.include_revoked === 'true',
            });
            return reply.send(result);
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message });
        }
    });

    // Batch: get awards for multiple entities
    app.get('/api/v2/badges/awards/batch', async (request, reply) => {
        try {
            const query = request.query as any;
            if (!query.entity_type || !query.entity_ids) {
                return reply.code(400).send({ error: 'entity_type and entity_ids are required' });
            }
            const entityIds = (query.entity_ids as string).split(',').filter(Boolean);
            if (entityIds.length > 100) {
                return reply.code(400).send({ error: 'Maximum 100 entity_ids per request' });
            }
            const data = await config.awardService.getByEntityIds(
                query.entity_type as BadgeEntityType,
                entityIds
            );
            return reply.send({ data });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message });
        }
    });
}
