/**
 * V2 Webhooks Service - Identity Service
 * Business logic for handling Clerk webhook events
 */

import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@splits-network/shared-logging';
import type { Logger } from '@splits-network/shared-logging';
import { EventPublisherV2 } from '../shared/events';
import { WebhookRepositoryV2 } from './repository';
import { ClerkWebhookEvent, ClerkUserData } from './types';

export class WebhooksServiceV2 {
    private logger: Logger;

    constructor(
        private repository: WebhookRepositoryV2,
        private events: EventPublisherV2
    ) {
        this.logger = createLogger({
            serviceName: 'identity-service',
            level: 'info'
        });
    }

    /**
     * Handle Clerk webhook events
     */
    async handleClerkWebhook(event: ClerkWebhookEvent): Promise<void> {
        this.logger.info({
            type: event.type,
            id: event.data.id
        }, 'Processing Clerk webhook event');

        try {
            switch (event.type) {
                case 'user.created':
                case 'user.updated':
                    await this.handleUserCreatedOrUpdated(event.data);
                    break;

                case 'user.deleted':
                    await this.handleUserDeleted(event.data);
                    break;

                default:
                    this.logger.warn({ type: event.type }, 'Unknown webhook event type');
            }
        } catch (error) {
            this.logger.error({
                type: event.type,
                userId: event.data.id,
                error: error instanceof Error ? error.message : 'Unknown error'
            }, 'Failed to process webhook event');
            throw error;
        }
    }

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
                    await this.events.publish('user.updated', {
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
                    name: name || email, // Use email as fallback if no name
                    status: 'active' as const,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                } as any; // Type assertion needed for webhook-created users

                const newUser = await this.repository.createUser(userData);

                // Publish user created event
                await this.events.publish('user.created', {
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
     * Handle user created or updated webhook event
     */
    private async handleUserCreatedOrUpdated(userData: ClerkWebhookEvent['data']): Promise<void> {
        const email = userData.email_addresses?.[0]?.email_address;
        const name = userData.first_name && userData.last_name
            ? `${userData.first_name} ${userData.last_name}`.trim()
            : userData.first_name || null;

        if (!email) {
            this.logger.warn({
                clerkUserId: userData.id
            }, 'User has no email address, skipping sync');
            return;
        }

        await this.syncClerkUser(userData.id, email, name || undefined);
    }

    /**
     * Handle user deleted webhook event
     */
    private async handleUserDeleted(userData: ClerkWebhookEvent['data']): Promise<void> {
        await this.repository.deleteUser(userData.id);

        // Publish user deleted event
        await this.events.publish('user.deleted', {
            clerkUserId: userData.id
        });

        this.logger.info({
            clerkUserId: userData.id
        }, 'User deleted from Clerk webhook');
    }
}
