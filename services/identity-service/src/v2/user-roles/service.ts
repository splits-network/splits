/**
 * V2 User Role Service - Identity Service
 * Handles entity-linked role assignment lifecycle and events.
 * Entity roles (recruiter, candidate) are managed by backend services, not API users.
 */

import { Logger } from '@splits-network/shared-logging';
import { EventPublisherV2 } from '../shared/events';
import { UserRoleUpdate } from './types';
import { UserRoleRepository } from './repository';
import { v4 as uuidv4 } from 'uuid';
import type { AccessContext } from '../shared/access';

export class UserRoleServiceV2 {
    constructor(
        private repository: UserRoleRepository,
        private eventPublisher: EventPublisherV2,
        private logger: Logger,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>
    ) { }

    private async requirePlatformAdmin(clerkUserId: string): Promise<AccessContext> {
        const access = await this.resolveAccessContext(clerkUserId);
        if (!access.isPlatformAdmin) {
            this.logger.warn({ clerkUserId }, 'UserRoleService - unauthorized access attempt');
            throw new Error('Platform admin permissions required');
        }
        return access;
    }

    /**
     * Find all user roles with pagination and filters.
     * Requires platform_admin — entity roles are managed by backend services.
     */
    async findUserRoles(clerkUserId: string, filters: any) {
        await this.requirePlatformAdmin(clerkUserId);

        this.logger.info({ filters }, 'UserRoleService.findUserRoles');
        const result = await this.repository.findUserRoles(filters);
        return result;
    }

    /**
     * Find user role by ID
     */
    async findUserRoleById(clerkUserId: string, id: string) {
        await this.requirePlatformAdmin(clerkUserId);
        this.logger.info({ id }, 'UserRoleService.findUserRoleById');

        const userRole = await this.repository.findUserRoleById(id);
        if (!userRole) {
            throw new Error(`User role not found: ${id}`);
        }

        return userRole;
    }

    /**
     * Create a new user role assignment (entity-linked)
     */
    async createUserRole(clerkUserId: string, roleData: any) {
        this.logger.info(
            {
                user_id: roleData.user_id,
                role_name: roleData.role_name,
                role_entity_id: roleData.role_entity_id,
            },
            'UserRoleService.createUserRole'
        );

        if (!roleData.user_id) {
            throw new Error('User ID is required');
        }

        if (!roleData.role_name) {
            throw new Error('Role name is required');
        }

        if (!roleData.role_entity_id) {
            throw new Error('Role entity ID is required');
        }

        const userRole = await this.repository.createUserRole({
            id: uuidv4(),
            user_id: roleData.user_id,
            role_name: roleData.role_name,
            role_entity_id: roleData.role_entity_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        await this.eventPublisher.publish('user_role.created', {
            user_role_id: userRole.id,
            user_id: userRole.user_id,
            role_name: userRole.role_name,
            role_entity_id: userRole.role_entity_id,
        });

        this.logger.info({ id: userRole.id }, 'UserRoleService.createUserRole - user role created');
        return userRole;
    }

    /**
     * Update user role
     */
    async updateUserRole(clerkUserId: string, id: string, updates: UserRoleUpdate) {
        await this.requirePlatformAdmin(clerkUserId);
        this.logger.info({ id, updates }, 'UserRoleService.updateUserRole');

        await this.findUserRoleById(clerkUserId, id);

        const updateData: any = {
            ...updates,
            updated_at: new Date().toISOString(),
        };

        const updated = await this.repository.updateUserRole(id, updateData);

        await this.eventPublisher.publish('user_role.updated', {
            user_role_id: id,
            changes: updateData,
        });

        this.logger.info({ id }, 'UserRoleService.updateUserRole - user role updated');
        return updated;
    }

    /**
     * Delete user role (soft delete)
     */
    async deleteUserRole(clerkUserId: string, id: string) {
        await this.requirePlatformAdmin(clerkUserId);
        this.logger.info({ id }, 'UserRoleService.deleteUserRole');

        await this.findUserRoleById(clerkUserId, id);
        await this.repository.deleteUserRole(id);

        await this.eventPublisher.publish('user_role.deleted', {
            user_role_id: id,
        });

        this.logger.info({ id }, 'UserRoleService.deleteUserRole - user role deleted');
    }
}
