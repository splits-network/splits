/**
 * Content Images Repository
 *
 * Data access layer for content_images table.
 * All operations require platform_admin role.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { ImageFilters, ImageCreate, ImageUpdate } from './types.js';

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}

export class ImageRepository {
    constructor(private supabase: SupabaseClient) {}

    getSupabase(): SupabaseClient {
        return this.supabase;
    }

    /**
     * List images with filtering and pagination (ADMIN).
     */
    async findImages(params: ImageFilters): Promise<RepositoryListResponse<any>> {
        const {
            search,
            tags,
            mime_type,
            page = 1,
            limit = 25,
            sort_by = 'created_at',
            sort_order = 'desc',
        } = params;

        let query = this.supabase
            .from('content_images')
            .select('*', { count: 'exact' })
            .is('deleted_at', null);

        if (search) {
            query = query.or(`filename.ilike.%${search}%,alt_text.ilike.%${search}%`);
        }
        if (tags) {
            const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
            if (tagList.length > 0) {
                query = query.contains('tags', tagList);
            }
        }
        if (mime_type) {
            query = query.eq('mime_type', mime_type);
        }

        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);
        query = query.order(sort_by, { ascending: sort_order === 'asc' });

        const { data, count, error } = await query;

        if (error) throw new Error(`Failed to list images: ${error.message}`);

        return { data: data || [], total: count || 0 };
    }

    /**
     * Get a single image by ID (ADMIN).
     */
    async findImageById(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from('content_images')
            .select('*')
            .eq('id', id)
            .is('deleted_at', null)
            .maybeSingle();

        if (error) throw new Error(`Failed to get image: ${error.message}`);

        return data;
    }

    /**
     * Create a new image record (ADMIN — requires platform_admin).
     */
    async createImage(image: ImageCreate, clerkUserId: string): Promise<any> {
        await this.requirePlatformAdmin(clerkUserId);

        const { data, error } = await this.supabase
            .from('content_images')
            .insert(image)
            .select()
            .single();

        if (error) throw new Error(`Failed to create image: ${error.message}`);

        return data;
    }

    /**
     * Update an existing image (ADMIN — requires platform_admin).
     */
    async updateImage(id: string, clerkUserId: string, updates: ImageUpdate): Promise<any> {
        await this.requirePlatformAdmin(clerkUserId);

        const { data, error } = await this.supabase
            .from('content_images')
            .update(updates)
            .eq('id', id)
            .is('deleted_at', null)
            .select()
            .single();

        if (error) throw new Error(`Failed to update image: ${error.message}`);

        return data;
    }

    /**
     * Soft-delete an image (ADMIN — requires platform_admin).
     */
    async deleteImage(id: string, clerkUserId: string): Promise<void> {
        await this.requirePlatformAdmin(clerkUserId);

        const { error } = await this.supabase
            .from('content_images')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .is('deleted_at', null);

        if (error) throw new Error(`Failed to delete image: ${error.message}`);
    }

    private async requirePlatformAdmin(clerkUserId: string): Promise<void> {
        if (clerkUserId === 'internal-service') return;

        const context = await resolveAccessContext(this.supabase, clerkUserId);

        if (!context.isPlatformAdmin) {
            throw new Error('Forbidden: platform_admin role required');
        }
    }
}
