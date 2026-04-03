import { FastifyInstance } from 'fastify';
import { requireUserContext } from '../helpers.js';
import { SavedJobRepositoryV2 } from './repository.js';
import { SavedJobServiceV2 } from './service.js';

export function savedJobRoutes(app: FastifyInstance, config: { service: SavedJobServiceV2, repository: SavedJobRepositoryV2 }) {
    const { repository, service } = config;

    app.get('/api/v2/saved-jobs', async (request: any, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { page = 1, limit = 25, ...filters } = request.query as any;

        const result = await repository.list(clerkUserId, { ...filters, page: Number(page), limit: Number(limit) });

        return reply.send({
            data: result.data,
            pagination: {
                total: result.total,
                page: Number(page),
                limit: Number(limit),
                total_pages: Math.ceil(result.total / Number(limit))
            }
        });
    });

    app.get('/api/v2/saved-jobs/:id', async (request: any, reply) => {
        const { clerkUserId } = requireUserContext(request);
        const { data, error } = await repository.getById(clerkUserId, request.params.id);

        if (error || !data) {
            return reply.status(404).send({ error: 'Saved job not found' });
        }

        return reply.send({ data });
    });

    app.post('/api/v2/saved-jobs', async (request: any, reply) => {
        const { clerkUserId } = requireUserContext(request);
        try {
            const data = await service.create(clerkUserId, request.body);
            return reply.status(201).send({ data });
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    });

    app.delete('/api/v2/saved-jobs/:id', async (request: any, reply) => {
        const { clerkUserId } = requireUserContext(request);
        try {
            const data = await service.delete(clerkUserId, request.params.id);
            return reply.send({ data, message: 'Saved job removed' });
        } catch (error: any) {
            return reply.status(404).send({ error: error.message });
        }
    });
}
