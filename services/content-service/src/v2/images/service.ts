/**
 * Content Images Service
 *
 * Business logic, validation, and event publishing for content images.
 */

import { randomUUID } from 'crypto';
import { ImageRepository } from './repository.js';
import { ContentImageStorage } from './storage.js';
import { ImageFilters, ImageUpdate } from './types.js';
import {
    validatePaginationParams,
    buildPaginationResponse,
} from '../shared/pagination.js';
import { IEventPublisher } from '../shared/events.js';

const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export class ImageServiceV2 {
    constructor(
        private repository: ImageRepository,
        private storage: ContentImageStorage,
        private eventPublisher?: IEventPublisher,
    ) {}

    /**
     * List images with pagination (ADMIN).
     */
    async getImages(filters: ImageFilters) {
        const { page, limit } = validatePaginationParams(
            filters.page,
            filters.limit,
        );
        const { data, total } = await this.repository.findImages({
            ...filters,
            page,
            limit,
        });

        return {
            data,
            pagination: buildPaginationResponse(data, total, page, limit)
                .pagination,
        };
    }

    /**
     * Get a single image by ID (ADMIN).
     */
    async getImageById(id: string) {
        return this.repository.findImageById(id);
    }

    /**
     * Upload a new content image (ADMIN).
     */
    async uploadImage(
        clerkUserId: string,
        file: Buffer,
        filename: string,
        contentType: string,
        altText?: string,
        tags?: string[],
    ) {
        // Validate MIME type
        if (!ALLOWED_MIME_TYPES.includes(contentType)) {
            throw new Error(
                `Invalid file type: ${contentType}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
            );
        }

        // Validate file size
        if (file.length > MAX_FILE_SIZE) {
            throw new Error(
                `File too large: ${(file.length / 1024 / 1024).toFixed(1)}MB. Maximum: 10MB`,
            );
        }

        // Sanitize filename
        const sanitized = filename
            .toLowerCase()
            .replace(/[^a-z0-9.\-_]/g, '-')
            .replace(/-+/g, '-');

        // Generate unique storage path
        const id = randomUUID();
        const storagePath = `images/${id}/${sanitized}`;

        // Upload to storage
        await this.storage.upload(storagePath, file, contentType);

        // Get public URL
        const publicUrl = this.storage.getPublicUrl(storagePath);

        // Create metadata record
        const image = await this.repository.createImage(
            {
                filename: sanitized,
                original_filename: filename,
                storage_path: storagePath,
                public_url: publicUrl,
                alt_text: altText || '',
                mime_type: contentType,
                file_size: file.length,
                tags: tags || [],
                uploaded_by: clerkUserId,
            },
            clerkUserId,
        );

        this.publishEvent('content-image.uploaded', {
            imageId: image.id,
            filename: image.filename,
            publicUrl: image.public_url,
        });

        return image;
    }

    /**
     * Update image metadata (ADMIN).
     */
    async updateImage(id: string, updates: ImageUpdate, clerkUserId: string) {
        const current = await this.repository.findImageById(id);
        if (!current) throw new Error(`Image ${id} not found`);

        const image = await this.repository.updateImage(id, clerkUserId, updates);

        this.publishEvent('content-image.updated', {
            imageId: image.id,
            filename: image.filename,
        });

        return image;
    }

    /**
     * Delete a content image (ADMIN).
     * Removes from storage and soft-deletes the metadata row.
     */
    async deleteImage(id: string, clerkUserId: string) {
        const image = await this.repository.findImageById(id);
        if (!image) throw new Error(`Image ${id} not found`);

        // Delete from storage
        try {
            await this.storage.deleteFile(image.storage_path);
        } catch (error) {
            // Log but don't fail — the metadata soft-delete is more important
            console.error(`Failed to delete image file from storage: ${error}`);
        }

        // Soft-delete the metadata row
        await this.repository.deleteImage(id, clerkUserId);

        this.publishEvent('content-image.deleted', {
            imageId: id,
            filename: image.filename,
        });
    }

    /* ─── Events ────────────────────────────────────────────────────────── */

    private publishEvent(
        eventType: string,
        payload: Record<string, any>,
    ): void {
        if (!this.eventPublisher) return;

        this.eventPublisher
            .publish(eventType, payload)
            .catch((error: unknown) => {
                console.error(`Failed to publish ${eventType} event:`, error);
            });
    }
}
