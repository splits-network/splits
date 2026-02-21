/**
 * Application Notes Service - V2
 * Business logic and event publishing
 */

import { ApplicationNoteRepository } from './repository';
import { ApplicationNoteFilters, ApplicationNoteCreate, ApplicationNoteUpdate, ApplicationNote } from './types';
import { IEventPublisher } from '../shared/events';
import { AccessContextResolver } from '@splits-network/shared-access-context';
import { SupabaseClient } from '@supabase/supabase-js';
import { StandardListResponse } from '@splits-network/shared-types';

export class ApplicationNoteServiceV2 {
    private accessResolver: AccessContextResolver;

    constructor(
        private repository: ApplicationNoteRepository,
        supabase: SupabaseClient,
        private eventPublisher?: IEventPublisher
    ) {
        this.accessResolver = new AccessContextResolver(supabase);
    }

    /**
     * List notes for an application
     */
    async list(
        clerkUserId: string,
        filters: ApplicationNoteFilters
    ): Promise<StandardListResponse<ApplicationNote>> {
        return this.repository.list(clerkUserId, filters);
    }

    /**
     * Get single note by ID
     */
    async getById(id: string, clerkUserId: string): Promise<ApplicationNote | null> {
        return this.repository.getById(id, clerkUserId);
    }

    /**
     * Create new note
     */
    async create(
        clerkUserId: string,
        data: ApplicationNoteCreate
    ): Promise<ApplicationNote> {
        // Validate message text
        if (!data.message_text || data.message_text.trim().length === 0) {
            throw new Error('Message text is required');
        }

        if (data.message_text.length > 10000) {
            throw new Error('Message text is too long (max 10000 characters)');
        }

        const note = await this.repository.create(clerkUserId, data);

        // Publish event
        if (this.eventPublisher) {
            const userContext = await this.accessResolver.resolve(clerkUserId);
            await this.eventPublisher.publish('application.note.created', {
                noteId: note.id,
                application_id: note.application_id,
                note_type: note.note_type,
                visibility: note.visibility,
                created_by_type: note.created_by_type,
                created_by_user_id: userContext.identityUserId,
                in_response_to_id: note.in_response_to_id,
                message_text: note.message_text,
            });
        }

        return note;
    }

    /**
     * Update note
     */
    async update(
        id: string,
        clerkUserId: string,
        updates: ApplicationNoteUpdate
    ): Promise<ApplicationNote> {
        // Validate message text if provided
        if (updates.message_text !== undefined) {
            if (!updates.message_text || updates.message_text.trim().length === 0) {
                throw new Error('Message text cannot be empty');
            }

            if (updates.message_text.length > 10000) {
                throw new Error('Message text is too long (max 10000 characters)');
            }
        }

        const note = await this.repository.update(id, clerkUserId, updates);

        // Publish event
        if (this.eventPublisher) {
            const userContext = await this.accessResolver.resolve(clerkUserId);
            await this.eventPublisher.publish('application.note.updated', {
                noteId: id,
                application_id: note.application_id,
                updatedBy: userContext.identityUserId,
            });
        }

        return note;
    }

    /**
     * Delete note
     */
    async delete(id: string, clerkUserId: string): Promise<void> {
        const note = await this.repository.getById(id, clerkUserId);

        if (!note) {
            throw new Error('Note not found or access denied');
        }

        await this.repository.delete(id, clerkUserId);

        // Publish event (non-blocking)
        if (this.eventPublisher) {
            try {
                const userContext = await this.accessResolver.resolve(clerkUserId);
                await this.eventPublisher.publish('application.note.deleted', {
                    noteId: id,
                    application_id: note.application_id,
                    deletedBy: userContext.identityUserId,
                });
            } catch (error) {
                // Log the error but don't prevent note deletion
                console.error('Failed to publish application.note.deleted event:', error);
            }
        }
    }
}
