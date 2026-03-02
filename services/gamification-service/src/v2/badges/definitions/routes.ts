import { FastifyInstance } from 'fastify';
import { BadgeDefinitionService } from './service';
import { requireUserContext, getOptionalUserContext } from '../../shared/helpers';
import { validatePaginationParams } from '../../shared/pagination';

export function registerBadgeDefinitionRoutes(
    app: FastifyInstance,
    config: { definitionService: BadgeDefinitionService }
) {
    // Public: list active badge definitions
    app.get('/api/v2/badges/definitions', async (request, reply) => {
        try {
            const query = request.query as any;
            const pagination = validatePaginationParams(query.page, query.limit);
            const result = await config.definitionService.list({
                ...pagination,
                entity_type: query.entity_type,
                status: query.status || 'active',
                tier: query.tier,
            });
            return reply.send(result);
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message });
        }
    });

    app.get('/api/v2/badges/definitions/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const data = await config.definitionService.getById(id);
            return reply.send({ data });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message });
        }
    });

    // Admin: create badge definition
    app.post('/api/v2/badges/definitions', async (request, reply) => {
        try {
            requireUserContext(request);
            const body = request.body as any;
            const data = await config.definitionService.create(body);
            return reply.code(201).send({ data });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message });
        }
    });

    // Admin: update badge definition
    app.patch('/api/v2/badges/definitions/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            const data = await config.definitionService.update(id, request.body as any);
            return reply.send({ data });
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message });
        }
    });

    // Admin: delete badge definition
    app.delete('/api/v2/badges/definitions/:id', async (request, reply) => {
        try {
            requireUserContext(request);
            const { id } = request.params as { id: string };
            await config.definitionService.delete(id);
            return reply.code(204).send();
        } catch (error: any) {
            return reply.code(error.statusCode || 500).send({ error: error.message });
        }
    });
}
