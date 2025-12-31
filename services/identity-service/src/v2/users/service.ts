/**
 * V2 User Service - Identity Service
 * Handles user lifecycle and events
 */

import { Logger } from '@splits-network/shared-logging';
import { EventPublisherV2 } from '../shared/events';
import { UserUpdate } from './types';
import { UserRepository } from './repository';
import { v4 as uuidv4 } from 'uuid';
import type { AccessContext } from '../shared/access';

export class UserServiceV2 {
    constructor(
        private repository: UserRepository,
        private eventPublisher: EventPublisherV2,
        private logger: Logger,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>
    ) {}

    private async requirePlatformAdmin(clerkUserId: string): Promise<AccessContext> {
        const access = await this.resolveAccessContext(clerkUserId);
        if (!access.isPlatformAdmin) {
            this.logger.warn({ clerkUserId }, 'UserService - unauthorized access attempt');
            throw new Error('Platform admin permissions required');
        }
        return access;
    }

    /**
     * Find all users with pagination and filters
     */
    async findUsers(clerkUserId: string, filters: any) {
        const access = await this.resolveAccessContext(clerkUserId);
        this.logger.info({ filters }, 'UserService.findUsers');

        if (!access.isPlatformAdmin) {
            if (!access.identityUserId) {
                this.logger.warn({ clerkUserId }, 'UserService.findUsers - no identity user in context');
                throw new Error('User not found');
            }

            const result = await this.repository.findUsers(filters, {
                accessibleUserIds: [access.identityUserId],
            });

            return {
                data: result.data.map(user => ({
                    ...user,
                    roles: access.roles,
                    organization_ids: access.organizationIds,
                    candidate_id: access.candidateId,
                    recruiter_id: access.recruiterId,
                    is_platform_admin: access.isPlatformAdmin,
                })),
                total: result.total,
            };
        }

        return this.repository.findUsers(filters);
    }

    /**
     * Find user by ID
     */
    async findUserById(clerkUserId: string, id: string) {
        await this.requirePlatformAdmin(clerkUserId);
        this.logger.info({ id }, 'UserService.findUserById');
        const user = await this.repository.findUserById(id);
        if (!user) {
            throw new Error(`User not found: ${id}`);
        }
        return user;
    }

    /**
     * Create a new user
     */
    async createUser(clerkUserId: string, userData: any) {
        await this.requirePlatformAdmin(clerkUserId);
        this.logger.info({ email: userData.email }, 'UserService.createUser');

        if (!userData.email) {
            throw new Error('Email is required');
        }

        if (!userData.clerk_user_id) {
            throw new Error('Clerk user ID is required');
        }

        const user = await this.repository.createUser({
            id: uuidv4(),
            email: userData.email,
            clerk_user_id: userData.clerk_user_id,
            full_name: userData.full_name || null,
            avatar_url: userData.avatar_url || null,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        await this.eventPublisher.publish('user.created', {
            user_id: user.id,
            email: user.email,
            clerk_user_id: user.clerk_user_id,
        });

        this.logger.info({ id: user.id }, 'UserService.createUser - user created');
        return user;
    }

    /**
     * Update user
     */
    async updateUser(clerkUserId: string, id: string, updates: UserUpdate) {
        await this.requirePlatformAdmin(clerkUserId);
        this.logger.info({ id, updates }, 'UserService.updateUser');

        const user = await this.findUserById(clerkUserId, id);

        const updateData: any = {
            ...updates,
            updated_at: new Date().toISOString(),
        };

        const updated = await this.repository.updateUser(id, updateData);

        await this.eventPublisher.publish('user.updated', {
            user_id: id,
            changes: updateData,
        });

        this.logger.info({ id }, 'UserService.updateUser - user updated');
        return updated;
    }

    /**
     * Delete user (soft delete)
     */
    async deleteUser(clerkUserId: string, id: string) {
        await this.requirePlatformAdmin(clerkUserId);
        this.logger.info({ id }, 'UserService.deleteUser');

        await this.findUserById(clerkUserId, id);
        await this.repository.deleteUser(id);

        await this.eventPublisher.publish('user.deleted', {
            user_id: id,
        });

        this.logger.info({ id }, 'UserService.deleteUser - user deleted');
    }
}
