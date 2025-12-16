/**
 * Users Routes
 * API endpoints for user management
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UsersService } from '../../services/users/service';
import { NotFoundError, BadRequestError } from '@splits-network/shared-fastify';

interface SyncClerkUserBody {
    clerk_user_id: string;
    email: string;
    name: string;
}

export function registerUsersRoutes(
    app: FastifyInstance,
    service: UsersService
) {
    // Get user profile by ID
    app.get(
        '/users/:id',
        async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            try {
                const profile = await service.getUserProfile(request.params.id);
                return reply.send({ data: profile });
            } catch (error: any) {
                if (error.message.includes('not found')) {
                    throw new NotFoundError('User', request.params.id);
                }
                throw error;
            }
        }
    );

    // Sync Clerk user (internal endpoint)
    app.post(
        '/sync-clerk-user',
        async (request: FastifyRequest<{ Body: SyncClerkUserBody }>, reply: FastifyReply) => {
            const { clerk_user_id, email, name } = request.body;

            if (!clerk_user_id || !email || !name) {
                throw new BadRequestError('Missing required fields');
            }

            const user = await service.syncClerkUser(clerk_user_id, email, name);
            return reply.send({ data: user });
        }
    );
}
