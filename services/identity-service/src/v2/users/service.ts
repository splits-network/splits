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
import { StandardListParams } from '@splits-network/shared-types';

export class UserServiceV2 {
    constructor(
        private repository: UserRepository,
        private eventPublisher: EventPublisherV2,
        private logger: Logger,
        private resolveAccessContext: (clerkUserId: string) => Promise<AccessContext>
    ) {}

    /**
     * Sync Clerk user data with internal database
     * Used by webhook events and other sync operations
     */
    async syncClerkUser(clerkUserId: string, email: string, name?: string): Promise<void> {
        try {
            // Check if user exists
            const existingUser = await this.repository.findUserByClerkId(clerkUserId);

            if (existingUser) {
                // Update existing user
                const updates: any = { updated_at: new Date().toISOString() };
                let hasChanges = false;

                if (email && existingUser.email !== email) {
                    updates.email = email;
                    hasChanges = true;
                }

                if (name && existingUser.name !== name) {
                    updates.name = name;
                    hasChanges = true;
                }

                if (hasChanges) {
                    await this.repository.updateUser(existingUser.id, updates);
                    
                    // Publish user updated event
                    await this.eventPublisher.publish('user.updated', {
                        userId: existingUser.id,
                        clerkUserId,
                        changes: Object.keys(updates).filter(key => key !== 'updated_at')
                    });

                    this.logger.info({
                        userId: existingUser.id,
                        clerkUserId,
                        changes: Object.keys(updates)
                    }, 'User updated from Clerk sync');
                }
            } else {
                // Create new user
                const userData = {
                    id: uuidv4(),
                    clerk_user_id: clerkUserId,
                    email,
                    name: name || null,
                    onboarding_status: 'pending' as const,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };

                const newUser = await this.repository.createUser(userData);

                // Publish user created event
                await this.eventPublisher.publish('user.created', {
                    userId: newUser.id,
                    clerkUserId: newUser.clerk_user_id,
                    email: newUser.email,
                    name: newUser.name
                });

                this.logger.info({
                    userId: newUser.id,
                    clerkUserId
                }, 'User created from Clerk sync');
            }
        } catch (error) {
            this.logger.error({
                clerkUserId,
                email,
                error: error instanceof Error ? error.message : 'Unknown error'
            }, 'Failed to sync Clerk user');
            throw error;
        }
    }

    /**
     * Find all users with pagination and filters
     */
    async findUsers(clerkUserId: string, params: StandardListParams = {}) {

        const result = await this.repository.findUsers(clerkUserId, params);

        return {
            data: result.data,
            pagination: result.pagination,
        };
    }

    /**
     * Find user by ID
     */
    async findUserById(clerkUserId: string, id: string) {
        this.logger.info({ id }, 'UserService.findUserById');
        const user = await this.repository.findUserById(id);
        if (!user) {
            throw new Error(`User not found: ${id}`);
        }
        return user;
    }

    /**
     * Find user by Clerk ID with enriched access context
     * Returns user data plus roles, recruiter_id, candidate_id, organization_ids
     * Used by /api/v2/users/me for frontend access control
     */
    async findUserByClerkId(clerkUserId: string) {
        this.logger.info({ clerkUserId }, 'UserService.findUserByClerkId');
        const user = await this.repository.findUserByClerkId(clerkUserId);
        if (!user) {
            throw new Error(`User not found for Clerk ID: ${clerkUserId}`);
        }

        // Get access context for role information
        const accessContext = await this.resolveAccessContext(clerkUserId);

        // Return enriched user object with access control data
        return {
            ...user,
            // Access control fields for frontend
            roles: accessContext.roles,
            is_platform_admin: accessContext.isPlatformAdmin,
            recruiter_id: accessContext.recruiterId,
            candidate_id: accessContext.candidateId,
            organization_ids: accessContext.organizationIds,
        };
    }

    /**
     * Create a new user
     */
    async createUser(clerkUserId: string, userData: any) {
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
            name: userData.name || null,
            //avatar_url: userData.avatar_url || null,
            onboarding_status: 'pending',
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
     * Register user (self-registration during sign-up)
     * Allows users to create their own account without admin permissions
     */
    async registerUser(clerkUserId: string, userData: any) {
        this.logger.info({ clerkUserId }, 'UserService.registerUser');

        // Security check: Ensure user can only register themselves
        if (userData.clerk_user_id !== clerkUserId) {
            throw new Error('Users can only register themselves');
        }

        // Validate required fields
        if (!userData.email) {
            throw new Error('Email is required for user registration');
        }

        // Check if user already exists
        const existingUser = await this.repository.findUserByClerkId(clerkUserId);
        
        if (existingUser) {
            throw new Error('User already registered');
        }

        // Create user data
        const createData: any = {
            clerk_user_id: clerkUserId,
            email: userData.email,
            name: userData.name || '',
            //image_url: userData.image_url,
            onboarding_status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const user = await this.repository.create(clerkUserId, createData);
        
        // Publish event for other services
        await this.eventPublisher?.publish('user.registered', {
            userId: user.id,
            clerkUserId,
            email: user.email,
        });

        this.logger.info({ id: user.id }, 'UserService.registerUser - user registered');
        return user;
    }

    /**
     * Update user
     */
    async updateUser(clerkUserId: string, id: string, updates: UserUpdate) {
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
        this.logger.info({ id }, 'UserService.deleteUser');

        await this.findUserById(clerkUserId, id);
        await this.repository.deleteUser(id);

        await this.eventPublisher.publish('user.deleted', {
            user_id: id,
        });

        this.logger.info({ id }, 'UserService.deleteUser - user deleted');
    }
}
