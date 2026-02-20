/**
 * Content Pages Repository
 *
 * Data access layer for content_pages table.
 * Public reads do NOT require auth. Admin writes require platform_admin role.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { PageFilters, PageCreate, PageUpdate } from './types';

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}

export class PageRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey, {
            db: { schema: 'public' },
        });
    }

    getSupabase(): SupabaseClient {
        return this.supabase;
    }

    /**
     * List pages with filtering and pagination (PUBLIC).
     * Defaults to status='published' for public queries.
     */
    async findPages(params: PageFilters): Promise<RepositoryListResponse<any>> {
        const {
            app,
            category,
            status = 'published',
            search,
            page = 1,
            limit = 25,
            sort_by = 'published_at',
            sort_order = 'desc',
        } = params;

        let query = this.supabase
            .from('content_pages')
            .select('*', { count: 'exact' })
            .is('deleted_at', null);

        if (app) query = query.eq('app', app);
        if (category) query = query.eq('category', category);
        if (status && status !== 'all') query = query.eq('status', status);
        if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

        // Pagination
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        // Sorting
        query = query.order(sort_by, { ascending: sort_order === 'asc' });

        const { data, count, error } = await query;

        if (error) throw new Error(`Failed to list pages: ${error.message}`);

        return { data: data || [], total: count || 0 };
    }

    /**
     * Get a single published page by slug and app (PUBLIC).
     */
    async findPageBySlug(slug: string, app: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from('content_pages')
            .select('*')
            .eq('slug', slug)
            .eq('app', app)
            .eq('status', 'published')
            .is('deleted_at', null)
            .maybeSingle();

        if (error) throw new Error(`Failed to get page: ${error.message}`);

        return data;
    }

    /**
     * Get a single page by ID (PUBLIC — returns any status for admin preview).
     */
    async findPageById(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            .from('content_pages')
            .select('*')
            .eq('id', id)
            .is('deleted_at', null)
            .maybeSingle();

        if (error) throw new Error(`Failed to get page: ${error.message}`);

        return data;
    }

    /**
     * Create a new page (ADMIN — requires platform_admin).
     */
    async createPage(page: PageCreate, clerkUserId: string): Promise<any> {
        await this.requirePlatformAdmin(clerkUserId);

        const { data, error } = await this.supabase
            .from('content_pages')
            .insert(page)
            .select()
            .single();

        if (error) throw new Error(`Failed to create page: ${error.message}`);

        return data;
    }

    /**
     * Update an existing page (ADMIN — requires platform_admin).
     */
    async updatePage(id: string, clerkUserId: string, updates: PageUpdate): Promise<any> {
        await this.requirePlatformAdmin(clerkUserId);

        const { data, error } = await this.supabase
            .from('content_pages')
            .update(updates)
            .eq('id', id)
            .is('deleted_at', null)
            .select()
            .single();

        if (error) throw new Error(`Failed to update page: ${error.message}`);

        return data;
    }

    /**
     * Soft-delete a page (ADMIN — requires platform_admin).
     */
    async deletePage(id: string, clerkUserId: string): Promise<void> {
        await this.requirePlatformAdmin(clerkUserId);

        const { error } = await this.supabase
            .from('content_pages')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .is('deleted_at', null);

        if (error) throw new Error(`Failed to delete page: ${error.message}`);
    }

    /**
     * Upsert a page by slug+app (ADMIN — used by import endpoint).
     */
    async upsertPage(page: PageCreate, clerkUserId: string): Promise<any> {
        await this.requirePlatformAdmin(clerkUserId);

        const { data, error } = await this.supabase
            .from('content_pages')
            .upsert(page, { onConflict: 'slug,app' })
            .select()
            .single();

        if (error) throw new Error(`Failed to upsert page: ${error.message}`);

        return data;
    }

    private async requirePlatformAdmin(clerkUserId: string): Promise<void> {
        if (clerkUserId === 'internal-service') return;

        const context = await resolveAccessContext(this.supabase, clerkUserId);

        if (!context.isPlatformAdmin) {
            throw new Error('Forbidden: platform_admin role required');
        }
    }
}
