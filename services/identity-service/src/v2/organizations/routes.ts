import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { OrganizationServiceV2 } from './service';
import {
    requireUserContext,
    validatePaginationParams,
    buildPaginationResponse,
} from '../shared/helpers';

interface RegisterOrganizationRoutesConfig {
    organizationService: OrganizationServiceV2;
    logError: (message: string, error: unknown) => void;
}

export function registerOrganizationRoutes(
    app: FastifyInstance,
    config: RegisterOrganizationRoutesConfig
) {
    const { organizationService, logError } = config;

    app.get('/api/v2/organizations', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as any;
            const paginationParams = validatePaginationParams(query.page, query.limit);

            const result = await organizationService.findOrganizations(clerkUserId, {
                ...paginationParams,
                search: query.search,
                status: query.status,
            });

            reply.send(
                buildPaginationResponse(
                    result.data,
                    result.total,
                    paginationParams.page,
                    paginationParams.limit
                )
            );
        } catch (error) {
            logError('GET /api/v2/organizations failed', error);
            reply.code(500).send({ error: { message: 'Failed to list organizations' } });
        }
    });

    app.get('/api/v2/organizations/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };

            const org = await organizationService.findOrganizationById(clerkUserId, id);
            reply.send({ data: org });
        } catch (error) {
            logError('GET /api/v2/organizations/:id failed', error);
            reply.code(500).send({ error: { message: 'Failed to fetch organization' } });
        }
    });

    app.post('/api/v2/organizations', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;

            const org = await organizationService.createOrganization(clerkUserId, body);
            reply.code(201).send({ data: org });
        } catch (error) {
            logError('POST /api/v2/organizations failed', error);
            reply.code(400).send({ error: { message: (error as Error).message } });
        }
    });

    app.patch('/api/v2/organizations/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const body = request.body as any;

            const org = await organizationService.updateOrganization(clerkUserId, id, body);
            reply.send({ data: org });
        } catch (error) {
            logError('PATCH /api/v2/organizations/:id failed', error);
            reply.code(400).send({ error: { message: (error as Error).message } });
        }
    });

    app.delete('/api/v2/organizations/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };

            await organizationService.deleteOrganization(clerkUserId, id);
            reply.code(204).send();
        } catch (error) {
            logError('DELETE /api/v2/organizations/:id failed', error);
            reply.code(400).send({ error: { message: (error as Error).message } });
        }
    });
}
