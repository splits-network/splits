import { FastifyInstance } from 'fastify';
import { RecruiterServiceV2 } from './service';
import { requireUserContext } from '../shared/helpers';
import { validatePaginationParams } from '../shared/pagination';

interface RegisterRecruiterRoutesConfig {
    recruiterService: RecruiterServiceV2;
}

export function registerRecruiterRoutes(
    app: FastifyInstance,
    config: RegisterRecruiterRoutesConfig
) {
    app.get('/v2/recruiters', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as any;

            const pagination = validatePaginationParams(query.page, query.limit);
            const filters = {
                ...pagination,
                search: query.search,
                status: query.status,
                specialization: query.specialization,
                sort_by: query.sort_by,
                sort_order: query.sort_order,
            };

            const result = await config.recruiterService.getRecruiters(clerkUserId, filters);
            return reply.send({ data: result });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    app.get('/v2/recruiters/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const recruiter = await config.recruiterService.getRecruiter(id);
            return reply.send({ data: recruiter });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    app.post('/v2/recruiters', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;
            const recruiter = await config.recruiterService.createRecruiter(body, clerkUserId);
            return reply.code(201).send({ data: recruiter });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    app.patch('/v2/recruiters/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const updates = request.body as any;
            const recruiter = await config.recruiterService.updateRecruiter(id, updates, clerkUserId);
            return reply.send({ data: recruiter });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    app.delete('/v2/recruiters/:id', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            await config.recruiterService.deleteRecruiter(id, clerkUserId);
            return reply.code(204).send();
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });
}
