/**
 * Application Feedback Service - V2
 * Business logic and event publishing
 */

import { ApplicationFeedbackRepository } from './repository';
import { ApplicationFeedbackFilters, ApplicationFeedbackCreate, ApplicationFeedbackUpdate } from './types';
import { EventPublisher } from '../shared/events';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { SupabaseClient } from '@supabase/supabase-js';
import { ApplicationFeedback } from '@splits-network/shared-types';
import { StandardListResponse } from '@splits-network/shared-types';

export class ApplicationFeedbackServiceV2 {
    private accessResolver: AccessContextResolver;

    constructor(
        private repository: ApplicationFeedbackRepository,
        supabase: SupabaseClient,
        private eventPublisher?: EventPublisher
    ) {
        this.accessResolver = new AccessContextResolver(supabase);
    }

    /**
     * List feedback for an application
     */
    async list(
        clerkUserId: string,
        filters: ApplicationFeedbackFilters
    ): Promise<StandardListResponse<ApplicationFeedback>> {
        return this.repository.list(clerkUserId, filters);
    }

    /**
     * Get single feedback by ID
     */
    async getById(id: string, clerkUserId: string): Promise<ApplicationFeedback | null> {
        return this.repository.getById(id, clerkUserId);
    }

    /**
     * Create new feedback
     */
    async create(
        clerkUserId: string,
        data: ApplicationFeedbackCreate
    ): Promise<ApplicationFeedback> {
        // Validate message text
        if (!data.message_text || data.message_text.trim().length === 0) {
            throw new Error('Message text is required');
        }

        if (data.message_text.length > 10000) {
            throw new Error('Message text is too long (max 10000 characters)');
        }

        const feedback = await this.repository.create(clerkUserId, data);

        // Publish event
        if (this.eventPublisher) {
            const userContext = await this.accessResolver.resolve(clerkUserId);
            await this.eventPublisher.publish('application.feedback.created', {
                feedbackId: feedback.id,
                application_id: feedback.application_id,
                feedback_type: feedback.feedback_type,
                created_by_type: feedback.created_by_type,
                created_by_user_id: userContext.identityUserId,
                in_response_to_id: feedback.in_response_to_id,
            });
        }

        return feedback;
    }

    /**
     * Update feedback
     */
    async update(
        id: string,
        clerkUserId: string,
        updates: ApplicationFeedbackUpdate
    ): Promise<ApplicationFeedback> {
        // Validate message text if provided
        if (updates.message_text !== undefined) {
            if (!updates.message_text || updates.message_text.trim().length === 0) {
                throw new Error('Message text cannot be empty');
            }

            if (updates.message_text.length > 10000) {
                throw new Error('Message text is too long (max 10000 characters)');
            }
        }

        const feedback = await this.repository.update(id, clerkUserId, updates);

        // Publish event
        if (this.eventPublisher) {
            const userContext = await this.accessResolver.resolve(clerkUserId);
            await this.eventPublisher.publish('application.feedback.updated', {
                feedbackId: id,
                application_id: feedback.application_id,
                updatedBy: userContext.identityUserId,
            });
        }

        return feedback;
    }

    /**
     * Delete feedback
     */
    async delete(id: string, clerkUserId: string): Promise<void> {
        const feedback = await this.repository.getById(id, clerkUserId);

        if (!feedback) {
            throw new Error('Feedback not found or access denied');
        }

        await this.repository.delete(id, clerkUserId);

        // Publish event
        if (this.eventPublisher) {
            const userContext = await this.accessResolver.resolve(clerkUserId);
            await this.eventPublisher.publish('application.feedback.deleted', {
                feedbackId: id,
                application_id: feedback.application_id,
                deletedBy: userContext.identityUserId,
            });
        }
    }
}
