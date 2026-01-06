import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { UserServiceV2 } from './service';
import {
    requireUserContext,
    validatePaginationParams,
} from '../shared/helpers';
import { StandardListParams } from '@splits-network/shared-types';

interface RegisterUserRoutesConfig {
    userService: UserServiceV2;
    logError: (message: string, error: unknown) => void;
}

export function registerUserRoutes(
    app: FastifyInstance,
    config: RegisterUserRoutesConfig
) {
    const { userService, logError } = config;

    app.get('/api/v2/users', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const params = request.query as any;
            const paginationParams = validatePaginationParams(params.page, params.limit);

            const listParams: StandardListParams = {
                ...paginationParams,
                search: params.search,
                sort_by: params.sort_by,
                sort_order: params.sort_order,
                filters: params.filters ??  undefined,
            };

            const result = await userService.findUsers(clerkUserId, listParams);

            reply.send(result);
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

    app.get('/api/v2/users/me', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const user = await userService.findUserByClerkId(clerkUserId);
            reply.send({ data: user });
        } catch (error) {
            logError('GET /api/v2/users/me failed', error);
            reply.code(500).send({ error: { message: 'Failed to fetch current user' } });
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

    // Self-registration endpoint for new user sign-ups
    app.post('/api/v2/users/register', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { clerkUserId } = requireUserContext(request);
            const body = request.body as any;
            
            // Security: User can only register themselves
            if (body.clerk_user_id && body.clerk_user_id !== clerkUserId) {
                reply.code(403).send({ error: { message: 'Can only register your own account' } });
                return;
            }

            const user = await userService.registerUser(clerkUserId, body);
            reply.code(201).send({ data: user });
        } catch (error) {
            logError('POST /api/v2/users/register failed', error);
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
