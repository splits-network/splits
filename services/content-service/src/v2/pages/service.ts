/**
 * Content Pages Service
 *
 * Business logic, validation, and event publishing for CMS pages.
 */

import { VALID_BLOCK_TYPES } from '@splits-network/shared-types';
import { PageRepository } from './repository';
import { PageFilters, PageCreate, PageUpdate } from './types';
import { validatePaginationParams, buildPaginationResponse } from '../shared/pagination';
import { EventPublisher } from '../shared/events';

export class PageServiceV2 {
    constructor(
        private repository: PageRepository,
        private eventPublisher?: EventPublisher
    ) {}

    /**
     * List pages with pagination (PUBLIC).
     */
    async getPages(filters: PageFilters) {
        const { page, limit } = validatePaginationParams(filters.page, filters.limit);
        const { data, total } = await this.repository.findPages({ ...filters, page, limit });

        return {
            data,
            pagination: buildPaginationResponse(data, total, page, limit).pagination,
        };
    }

    /**
     * Get a published page by slug and app (PUBLIC).
     */
    async getPageBySlug(slug: string, app: string) {
        const page = await this.repository.findPageBySlug(slug, app);
        if (!page) return null;
        return page;
    }

    /**
     * Get a page by ID (PUBLIC).
     */
    async getPageById(id: string) {
        return this.repository.findPageById(id);
    }

    /**
     * Create a new page (ADMIN).
     */
    async createPage(data: PageCreate, clerkUserId: string) {
        this.validatePageData(data);

        // Auto-set published_at when creating as published
        if (data.status === 'published' && !data.published_at) {
            data.published_at = new Date().toISOString();
        }

        let page;
        try {
            page = await this.repository.createPage(data, clerkUserId);
        } catch (error: any) {
            if (error.message?.includes('duplicate') || error.message?.includes('unique') || error.message?.includes('23505')) {
                throw new Error(`A page with slug "${data.slug}" already exists for the ${data.app} app`);
            }
            throw error;
        }

        this.publishEvent('page.created', {
            pageId: page.id,
            slug: page.slug,
            app: page.app,
            status: page.status,
        });

        return page;
    }

    /**
     * Update a page (ADMIN).
     */
    async updatePage(id: string, updates: PageUpdate, clerkUserId: string) {
        const current = await this.repository.findPageById(id);
        if (!current) throw new Error(`Page ${id} not found`);

        // Validate blocks if provided
        if (updates.blocks) {
            this.validateBlocks(updates.blocks);
        }

        // Validate slug if changing
        if (updates.slug) {
            this.validateSlug(updates.slug);
        }

        // Auto-set published_at on status transition to published
        if (updates.status === 'published' && current.status !== 'published' && !updates.published_at) {
            updates.published_at = new Date().toISOString();
        }

        const page = await this.repository.updatePage(id, clerkUserId, updates);

        this.publishEvent('page.updated', {
            pageId: page.id,
            slug: page.slug,
            app: page.app,
            status: page.status,
            previousStatus: current.status,
        });

        return page;
    }

    /**
     * Soft-delete a page (ADMIN).
     */
    async deletePage(id: string, clerkUserId: string) {
        const page = await this.repository.findPageById(id);
        if (!page) throw new Error(`Page ${id} not found`);

        await this.repository.deletePage(id, clerkUserId);

        this.publishEvent('page.deleted', {
            pageId: id,
            slug: page.slug,
            app: page.app,
        });
    }

    /**
     * Import a page from JSON (ADMIN). Creates as draft, or upserts if requested.
     */
    async importPage(data: PageCreate, clerkUserId: string, upsert = false) {
        this.validatePageData(data);

        // Imported pages default to draft
        if (!data.status) {
            data.status = 'draft';
        }

        const page = upsert
            ? await this.repository.upsertPage(data, clerkUserId)
            : await this.repository.createPage(data, clerkUserId);

        this.publishEvent('page.imported', {
            pageId: page.id,
            slug: page.slug,
            app: page.app,
            upsert,
        });

        return page;
    }

    /* ─── Validation ────────────────────────────────────────────────────── */

    private validatePageData(data: PageCreate): void {
        if (!data.title?.trim()) throw new Error('Title is required');
        if (!data.slug?.trim()) throw new Error('Slug is required');
        if (!data.app?.trim()) throw new Error('App is required');

        const validApps = ['portal', 'candidate', 'corporate'];
        if (!validApps.includes(data.app)) {
            throw new Error(`Invalid app: ${data.app}. Must be one of: ${validApps.join(', ')}`);
        }

        this.validateSlug(data.slug);

        if (!Array.isArray(data.blocks)) {
            throw new Error('Blocks must be an array');
        }

        this.validateBlocks(data.blocks);
    }

    private validateSlug(slug: string): void {
        if (!/^[a-z0-9][a-z0-9\-\/]*[a-z0-9]$/.test(slug) && slug.length > 1) {
            throw new Error(
                'Slug must be lowercase, using only letters, numbers, hyphens, and slashes'
            );
        }
    }

    private validateBlocks(blocks: any[]): void {
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            if (!block || !block.type) {
                throw new Error(`Block at index ${i} is missing a type`);
            }
            if (!VALID_BLOCK_TYPES.includes(block.type)) {
                throw new Error(
                    `Block at index ${i} has invalid type "${block.type}". Valid types: ${VALID_BLOCK_TYPES.join(', ')}`
                );
            }
        }
    }

    /* ─── Events ────────────────────────────────────────────────────────── */

    private publishEvent(eventType: string, payload: Record<string, any>): void {
        if (!this.eventPublisher) return;

        this.eventPublisher.publish(eventType, payload).catch((error) => {
            console.error(`Failed to publish ${eventType} event:`, error);
        });
    }
}
