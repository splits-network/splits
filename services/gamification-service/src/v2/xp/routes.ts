import { FastifyInstance } from 'fastify';
import { XpService } from './service';
import { getOptionalUserContext } from '../shared/helpers';
import { validatePaginationParams } from '../shared/pagination';
import { BadgeEntityType } from '../badges/definitions/types';

export function registerXpRoutes(
    app: FastifyInstance,
    config: { xpService: XpService }
) {
    // Get entity level
    app.get('/api/v2/xp/level', async (request, reply) => {
        try {
            const query = request.query as any;
            if (!query.entity_type || !query.entity_id) {
                return reply.code(400).send({ error: 'entity_type and entity_id are required' });
            }
            const data = await config.xpService.getLevel(
                query.entity_type as BadgeEntityType,
                query.entity_id
            );
            return reply.send({ data });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message });
        }
    });

    // Batch: get levels for multiple entities
    app.get('/api/v2/xp/levels/batch', async (request, reply) => {
        try {
            const query = request.query as any;
            if (!query.entity_type || !query.entity_ids) {
                return reply.code(400).send({ error: 'entity_type and entity_ids are required' });
            }
            const entityIds = (query.entity_ids as string).split(',').filter(Boolean);
            if (entityIds.length > 100) {
                return reply.code(400).send({ error: 'Maximum 100 entity_ids per request' });
            }
            const data = await config.xpService.getLevelsBatch(
                query.entity_type as BadgeEntityType,
                entityIds
            );
            return reply.send({ data });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message });
        }
    });

    // Get XP history
    app.get('/api/v2/xp/history', async (request, reply) => {
        try {
            const query = request.query as any;
            if (!query.entity_type || !query.entity_id) {
                return reply.code(400).send({ error: 'entity_type and entity_id are required' });
            }
            const pagination = validatePaginationParams(query.page, query.limit);
            const result = await config.xpService.getHistory({
                entity_type: query.entity_type as BadgeEntityType,
                entity_id: query.entity_id,
                source: query.source,
                ...pagination,
            });
            return reply.send(result);
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message });
        }
    });

    // Get XP rules (public reference)
    app.get('/api/v2/xp/rules', async (request, reply) => {
        try {
            const data = await config.xpService.getRules();
            return reply.send({ data });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message });
        }
    });

    // Get level thresholds (public reference)
    app.get('/api/v2/xp/thresholds', async (request, reply) => {
        try {
            const data = await config.xpService.getThresholdsList();
            return reply.send({ data });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message });
        }
    });

    // ── V3 aliases ──

    app.get('/api/v3/xp/levels/batch', async (request, reply) => {
        try {
            const query = request.query as any;
            if (!query.entity_type || !query.entity_ids) {
                return reply.code(400).send({ error: 'entity_type and entity_ids are required' });
            }
            const entityIds = (query.entity_ids as string).split(',').filter(Boolean);
            if (entityIds.length > 100) {
                return reply.code(400).send({ error: 'Maximum 100 entity_ids per request' });
            }
            const data = await config.xpService.getLevelsBatch(
                query.entity_type as BadgeEntityType,
                entityIds
            );
            return reply.send({ data });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message });
        }
    });

    app.get('/api/v3/xp/level', async (request, reply) => {
        try {
            const query = request.query as any;
            if (!query.entity_type || !query.entity_id) {
                return reply.code(400).send({ error: 'entity_type and entity_id are required' });
            }
            const data = await config.xpService.getLevel(
                query.entity_type as BadgeEntityType,
                query.entity_id
            );
            return reply.send({ data });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message });
        }
    });

    app.get('/api/v3/xp/history', async (request, reply) => {
        try {
            const query = request.query as any;
            if (!query.entity_type || !query.entity_id) {
                return reply.code(400).send({ error: 'entity_type and entity_id are required' });
            }
            const pagination = validatePaginationParams(query.page, query.limit);
            const result = await config.xpService.getHistory({
                entity_type: query.entity_type as BadgeEntityType,
                entity_id: query.entity_id,
                source: query.source,
                ...pagination,
            });
            return reply.send(result);
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message });
        }
    });
}
