import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { UserServiceV2 } from './service';
import {
    requireUserContext,
    validatePaginationParams,
    buildPaginationResponse,
} from '../shared/helpers';

interface RegisterUserRoutesConfig {
    userService: UserServiceV2;
    logError: (message: string, error: unknown) => void;
}

export function registerUserRoutes(
    app: FastifyInstance,
    config: RegisterUserRoutesConfig
) {
    const { userService, logError } = config;

    app.get('/api/v2/users/me', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const user = await userService.getCurrentUser(clerkUserId);
            reply.send({ data: user });
        } catch (error) {
            logError('GET /api/v2/users/me failed', error);
            reply
                .code((error as any)?.statusCode || 404)
                .send({ error: { message: (error as Error).message || 'User not found' } });
        }
    });

    app.get('/api/v2/users', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const paginationParams = validatePaginationParams(request.query as any);

            const result = await userService.findUsers(clerkUserId, {
                ...paginationParams,
                search: (request.query as any).search,
                status: (request.query as any).status,
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
            logError('GET /api/v2/users failed', error);
            reply.code(500).send({ error: { message: 'Failed to list users' } });
        }
    });

    app.get('/api/v2/users/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };

            const user = await userService.findUserById(clerkUserId, id);
            reply.send({ data: user });
        } catch (error) {
            logError('GET /api/v2/users/:id failed', error);
            reply.code(500).send({ error: { message: 'Failed to fetch user' } });
        }
    });

    app.post('/api/v2/users', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;

            const user = await userService.createUser(clerkUserId, body);
            reply.code(201).send({ data: user });
        } catch (error) {
            logError('POST /api/v2/users failed', error);
            reply.code(400).send({ error: { message: (error as Error).message } });
        }
    });

    app.patch('/api/v2/users/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };
            const body = request.body as any;

            const user = await userService.updateUser(clerkUserId, id, body);
            reply.send({ data: user });
        } catch (error) {
            logError('PATCH /api/v2/users/:id failed', error);
            reply.code(400).send({ error: { message: (error as Error).message } });
        }
    });

    app.delete('/api/v2/users/:id', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const { id } = request.params as { id: string };

            await userService.deleteUser(clerkUserId, id);
            reply.code(204).send();
        } catch (error) {
            logError('DELETE /api/v2/users/:id failed', error);
            reply.code(400).send({ error: { message: (error as Error).message } });
        }
    });
}
