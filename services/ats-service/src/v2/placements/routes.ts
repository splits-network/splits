import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { PlacementServiceV2 } from './service';
import { PlacementUpdate } from './types';
import { requireUserContext } from '../shared/helpers';

interface RegisterPlacementRoutesConfig {
    placementService: PlacementServiceV2;
}

export function registerPlacementRoutes(
    app: FastifyInstance,
    config: RegisterPlacementRoutesConfig
) {
    app.get('/v2/placements', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const filters = request.query as any;
            const result = await config.placementService.getPlacements(clerkUserId, filters);
            return reply.send({ data: result.data, pagination: result.pagination });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.get('/v2/placements/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { id } = request.params as any;
            const placement = await config.placementService.getPlacement(id);
            return reply.send({ data: placement });
        } catch (error: any) {
            return reply.code(404).send({ error: { message: error.message } });
        }
    });

    app.post('/v2/placements', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const placement = await config.placementService.createPlacement(request.body as any, clerkUserId);
            return reply.code(201).send({ data: placement });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.patch('/v2/placements/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            const placement = await config.placementService.updatePlacement(
                id,
                request.body as PlacementUpdate,
                clerkUserId
            );
            return reply.send({ data: placement });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });

    app.delete('/v2/placements/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as any;
            await config.placementService.deletePlacement(id, clerkUserId);
            return reply.send({ data: { message: 'Placement deleted successfully' } });
        } catch (error: any) {
            return reply.code(400).send({ error: { message: error.message } });
        }
    });
}
