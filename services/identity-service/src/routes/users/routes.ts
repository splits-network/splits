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

interface UpdateUserProfileBody {
    name?: string;
}

interface ChangePasswordBody {
    currentPassword: string;
    newPassword: string;
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

    // Update user profile
    app.patch(
        '/users/:id',
        async (request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserProfileBody }>, reply: FastifyReply) => {
            const { id } = request.params;
            const updates = request.body;

            // Validate that name is provided and is a string
            if (!updates.name || typeof updates.name !== 'string' || updates.name.trim().length === 0) {
                throw new BadRequestError('Name is required and must be a non-empty string');
            }

            try {
                const user = await service.updateUserProfile(id, { name: updates.name.trim() });
                return reply.send({ data: user });
            } catch (error: any) {
                if (error.message.includes('not found')) {
                    throw new NotFoundError('User', id);
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

    // Change password
    app.post(
        '/users/:id/change-password',
        async (request: FastifyRequest<{ Params: { id: string }; Body: ChangePasswordBody }>, reply: FastifyReply) => {
            const { id } = request.params;
            const { currentPassword, newPassword } = request.body;

            // Validate inputs
            if (!currentPassword || typeof currentPassword !== 'string') {
                throw new BadRequestError('Current password is required');
            }

            if (!newPassword || typeof newPassword !== 'string') {
                throw new BadRequestError('New password is required');
            }

            if (newPassword.length < 8) {
                throw new BadRequestError('New password must be at least 8 characters long');
            }

            try {
                await service.changeUserPassword(id, currentPassword, newPassword);
                return reply.send({
                    data: {
                        success: true,
                        message: 'Password changed successfully',
                    },
                });
            } catch (error: any) {
                if (error.message.includes('not found')) {
                    throw new NotFoundError('User', id);
                }
                if (error.message.includes('does not meet requirements')) {
                    throw new BadRequestError(error.message);
                }
                throw error;
            }
        }
    );
}
