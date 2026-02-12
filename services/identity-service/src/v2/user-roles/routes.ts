import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { UserRoleServiceV2 } from './service';
import {
    requireUserContext,
    validatePaginationParams,
    buildPaginationResponse,
} from '../shared/helpers';

interface RegisterUserRoleRoutesConfig {
    userRoleService: UserRoleServiceV2;
    logError: (message: string, error: unknown) => void;
}

export function registerUserRoleRoutes(
    app: FastifyInstance,
    config: RegisterUserRoleRoutesConfig
) {
    const { userRoleService, logError } = config;

    app.get('/api/v2/user-roles', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const query = request.query as any;
            const paginationParams = validatePaginationParams(query.page, query.limit);

            const result = await userRoleService.findUserRoles(clerkUserId, {
                ...paginationParams,
                user_id: query.user_id,
                role_name: query.role_name,
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
            logError('GET /api/v2/user-roles failed', error);
            reply.code(500).send({ error: { message: 'Failed to list user roles' } });
        }
    });

    app.get('/api/v2/user-roles/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };

            const userRole = await userRoleService.findUserRoleById(clerkUserId, id);
            reply.send({ data: userRole });
        } catch (error) {
            logError('GET /api/v2/user-roles/:id failed', error);
            reply.code(500).send({ error: { message: 'Failed to fetch user role' } });
        }
    });

    app.post('/api/v2/user-roles', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;

            const userRole = await userRoleService.createUserRole(clerkUserId, body);
            reply.code(201).send({ data: userRole });
        } catch (error) {
            logError('POST /api/v2/user-roles failed', error);
            reply.code(400).send({ error: { message: (error as Error).message } });
        }
    });

    app.patch('/api/v2/user-roles/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const body = request.body as any;

            const userRole = await userRoleService.updateUserRole(clerkUserId, id, body);
            reply.send({ data: userRole });
        } catch (error) {
            logError('PATCH /api/v2/user-roles/:id failed', error);
            reply.code(400).send({ error: { message: (error as Error).message } });
        }
    });

    app.delete('/api/v2/user-roles/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };

            await userRoleService.deleteUserRole(clerkUserId, id);
            reply.code(204).send();
        } catch (error) {
            logError('DELETE /api/v2/user-roles/:id failed', error);
            reply.code(400).send({ error: { message: (error as Error).message } });
        }
    });
}
