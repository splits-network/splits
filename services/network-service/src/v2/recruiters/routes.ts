import { FastifyInstance } from 'fastify';
import { RecruiterServiceV2 } from './service';
import { requireUserContext, getOptionalUserContext } from '../shared/helpers';
import { validatePaginationParams } from '../shared/pagination';

interface RegisterRecruiterRoutesConfig {
    recruiterService: RecruiterServiceV2;
}

export function registerRecruiterRoutes(
    app: FastifyInstance,
    config: RegisterRecruiterRoutesConfig
) {
    // GET /me endpoint - must be BEFORE generic /recruiters routes
    app.get('/api/v2/recruiters/me', async (request, reply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const recruiter = await config.recruiterService.getRecruiterByClerkId(clerkUserId);
            return reply.send({ data: recruiter });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 404)
                .send({ error: { message: error.message || 'Recruiter profile not found' } });
        }
    });

    app.get('/api/v2/recruiters', async (request, reply) => {
        try {
            // Allow both authenticated and unauthenticated access for marketplace browsing
            const { clerkUserId } = getOptionalUserContext(request);
            const query = request.query as any;

            const pagination = validatePaginationParams(query.page, query.limit);

            // Parse filters object if present (comes as JSON string from query params)
            let parsedFilters: Record<string, any> = {};
            if (query.filters) {
                try {
                    parsedFilters = typeof query.filters === 'string'
                        ? JSON.parse(query.filters)
                        : query.filters;
                } catch (e) {
                    console.error('Failed to parse filters:', e);
                }
            }

            // Extract filters from both direct query params and nested filters object
            const status = query.status || parsedFilters.status;
            const specialization = query.specialization || parsedFilters.specialization;

            const filters = {
                ...pagination,
                search: query.search,
                status,
                specialization,
                sort_by: query.sort_by,
                sort_order: query.sort_order,
                filters: parsedFilters, // Include the filters object for repository
                include: query.include,
            };

            const result = await config.recruiterService.getRecruiters(clerkUserId, filters);
            return reply.send(result);
        } catch (error: any) {
            console.error('Error in GET /api/v2/recruiters:', error);
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    app.get('/api/v2/recruiters/:id', async (request, reply) => {
        try {
            const { clerkUserId } = getOptionalUserContext(request);
            const { id } = request.params as { id: string };
            const query = request.query as { include?: string };
            const recruiter = await config.recruiterService.getRecruiter(id, clerkUserId, query.include);
            return reply.send({ data: recruiter });
        } catch (error: any) {
            return reply
                .code(error.statusCode || 500)
                .send({ error: error.message || 'Internal server error' });
        }
    });

    app.post('/api/v2/recruiters', async (request, reply) => {
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

    app.patch('/api/v2/recruiters/:id', async (request, reply) => {
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

    app.delete('/api/v2/recruiters/:id', async (request, reply) => {
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
