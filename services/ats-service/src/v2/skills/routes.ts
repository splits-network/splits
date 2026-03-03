import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { SkillService } from './service';
import { requireUserContext } from '../shared/helpers';

interface RegisterSkillRoutesConfig {
    service: SkillService;
}

export function registerSkillRoutes(
    app: FastifyInstance,
    config: RegisterSkillRoutesConfig
) {
    // Search/list skills (typeahead)
    app.get('/api/v2/skills', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { q, page, limit } = request.query as { q?: string; page?: string; limit?: string };

            if (q) {
                const data = await config.service.searchSkills(q, limit ? parseInt(limit) : 10);
                return reply.send({ data });
            }

            const data = await config.service.listSkills(
                page ? parseInt(page) : 1,
                limit ? parseInt(limit) : 50
            );
            return reply.send({ data: data.data, pagination: { total: data.total } });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to load skills' } });
        }
    });

    // Get single skill
    app.get('/api/v2/skills/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            requireUserContext(request);
            const { id } = request.params;
            const data = await config.service.getSkill(id);
            return reply.send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 404)
                .send({ error: { message: error.message || 'Skill not found' } });
        }
    });

    // Create skill (find-or-create by slug)
    app.post('/api/v2/skills', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userContext = requireUserContext(request);
            const { name } = request.body as { name: string };
            const data = await config.service.findOrCreate(name, userContext.clerkUserId);
            return reply.code(201).send({ data });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 400)
                .send({ error: { message: error.message || 'Failed to create skill' } });
        }
    });
}
