import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { PerkService } from './service.js';
import { requireUserContext } from '../shared/helpers.js';

interface RegisterPerkRoutesConfig {
    service: PerkService;
}

export function registerPerkRoutes(
    app: FastifyInstance,
    config: RegisterPerkRoutesConfig
) {
    // Search perks (typeahead)
    app.get('/api/v2/perks', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { q, limit } = request.query as { q?: string; limit?: string };

            if (!q) {
                return reply.send({ data: [] });
            }

            const data = await config.service.searchPerks(q, limit ? parseInt(limit) : 20);
            return reply.send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to load perks' } });
        }
    });

    // Create perk (find-or-create by slug)
    app.post('/api/v2/perks', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userContext = requireUserContext(request);
            const { name } = request.body as { name: string };
            const { perk, created } = await config.service.findOrCreate(name, userContext.clerkUserId);
            return reply.code(created ? 201 : 200).send({ data: perk });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to create perk' } });
        }
    });
}
