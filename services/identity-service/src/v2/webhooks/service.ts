/**
 * V2 Webhooks Service - Identity Service
 * Business logic for handling Clerk webhook events
 */

import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@splits-network/shared-logging';
import type { Logger } from '@splits-network/shared-logging';
import { EventPublisherV2, IEventPublisher } from '../shared/events';
import { WebhookRepositoryV2 } from './repository';
import { ClerkWebhookEvent, ClerkUserData, WebhookSourceApp } from './types';

export class WebhooksServiceV2 {
    private logger: Logger;

    constructor(
        private repository: WebhookRepositoryV2,
        private events: IEventPublisher
    ) {
        this.logger = createLogger({
            serviceName: 'identity-service',
            level: 'info'
        });
    }

    /**
     * Handle Clerk webhook events
     */
    async handleClerkWebhook(event: ClerkWebhookEvent, sourceApp: WebhookSourceApp = 'unknown'): Promise<void> {
        this.logger.info({
            type: event.type,
            id: event.data.id,
            sourceApp,
        }, 'Processing Clerk webhook event');

        try {
            switch (event.type) {
                case 'user.created':
                case 'user.updated':
                    await this.handleUserCreatedOrUpdated(event.data, sourceApp);
                    break;

                case 'user.deleted':
                    // User deletion is not currently supported - ignore the event
                    this.logger.info({ clerkUserId: event.data.id }, 'Ignoring user.deleted webhook event');
                    break;

                default:
                    this.logger.warn({ type: event.type }, 'Unknown webhook event type');
            }
        } catch (error) {
            this.logger.error({
                type: event.type,
                userId: event.data.id,
                error: error instanceof Error ? error.message : JSON.stringify(error)
            }, 'Failed to process webhook event');
            throw error;
        }
    }

    /**
     * Sync Clerk user data with internal database
     * Used by webhook events and other sync operations
     */
    async syncClerkUser(clerkUserId: string, email: string, name?: string, sourceApp: WebhookSourceApp = 'unknown'): Promise<void> {
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

                // Ensure candidate exists for candidate-app users
                if (sourceApp === 'candidate') {
                    await this.ensureCandidateExists(existingUser.id, email, name || email);
                }
            } else {
                // Create new user
                const userData = {
                    id: uuidv4(),
                    clerk_user_id: clerkUserId,
                    email,
                    name: name || email, // Use email as fallback if no name
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

                // Create candidate record for candidate-app signups
                if (sourceApp === 'candidate') {
                    await this.ensureCandidateExists(newUser.id, email, name || email);
                }
            }
        } catch (error) {
            this.logger.error({
                clerkUserId,
                email,
                error: error instanceof Error ? error.message : JSON.stringify(error)
            }, 'Failed to sync Clerk user');
            throw error;
        }
    }

    /**
     * Ensure a candidate record exists for a user.
     * Handles three cases:
     * 1. Candidate already linked to this user → no-op
     * 2. Candidate exists with same email but user_id IS NULL (recruiter-created) → claim it
     * 3. No candidate exists → create new one
     */
    private async ensureCandidateExists(userId: string, email: string, fullName: string): Promise<void> {
        try {
            // Case 1: Already linked by user_id
            const existing = await this.repository.findCandidateByUserId(userId);
            if (existing) {
                this.logger.info({ userId, candidateId: existing.id }, 'Candidate already exists for user');
                return;
            }

            // Case 2: Recruiter-created candidate with same email but no user_id — claim it
            const byEmail = await this.repository.findCandidateByEmail(email);
            if (byEmail && !byEmail.user_id) {
                await this.repository.claimCandidateForUser(byEmail.id, userId);
                await this.repository.createCandidateUserRole(userId, byEmail.id);

                this.logger.info({
                    userId,
                    candidateId: byEmail.id,
                }, 'Claimed recruiter-created candidate for user (linked user_id)');
                return;
            }

            if (byEmail && byEmail.user_id) {
                // Candidate exists with a DIFFERENT user_id — don't steal it
                this.logger.warn({
                    userId,
                    existingUserId: byEmail.user_id,
                    candidateId: byEmail.id,
                    email,
                }, 'Candidate with this email already linked to a different user');
                return;
            }

            // Case 3: No candidate at all — create new
            const candidate = await this.repository.createCandidate(userId, email, fullName);
            await this.repository.createCandidateUserRole(userId, candidate.id);

            this.logger.info({
                userId,
                candidateId: candidate.id,
            }, 'Candidate created from webhook');
        } catch (error) {
            // Log but don't fail the webhook — candidate can be created by the fallback
            this.logger.error({
                userId,
                error: error instanceof Error ? error.message : JSON.stringify(error)
            }, 'Failed to create candidate from webhook (non-fatal)');
        }
    }

    /**
     * Handle user created or updated webhook event
     */
    private async handleUserCreatedOrUpdated(userData: ClerkWebhookEvent['data'], sourceApp: WebhookSourceApp): Promise<void> {
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

        await this.syncClerkUser(userData.id, email, name || undefined, sourceApp);
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
