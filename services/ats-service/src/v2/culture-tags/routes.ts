import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CultureTagService } from './service';
import { requireUserContext } from '../shared/helpers';

interface RegisterCultureTagRoutesConfig {
    service: CultureTagService;
}

export function registerCultureTagRoutes(
    app: FastifyInstance,
    config: RegisterCultureTagRoutesConfig
) {
    // Search culture tags (typeahead)
    app.get('/api/v2/culture-tags', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { q, limit } = request.query as { q?: string; limit?: string };

            if (!q) {
                return reply.send({ data: [] });
            }

            const data = await config.service.searchCultureTags(q, limit ? parseInt(limit) : 20);
            return reply.send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to load culture tags' } });
        }
    });

    // Create culture tag (find-or-create by slug)
    app.post('/api/v2/culture-tags', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userContext = requireUserContext(request);
            const { name } = request.body as { name: string };
            const { cultureTag, created } = await config.service.findOrCreate(name, userContext.clerkUserId);
            return reply.code(created ? 201 : 200).send({ data: cultureTag });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to create culture tag' } });
        }
    });
}
