/**
 * Content Navigation Repository
 *
 * Data access layer for content_navigation table.
 * Public reads do NOT require auth. Admin writes require platform_admin role.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import type { ContentNavigation, HeaderNavConfig, FooterNavConfig } from '@splits-network/shared-types';

export class NavigationRepository {
    constructor(private supabase: SupabaseClient) {}

    /**
     * Get navigation config by app and location (PUBLIC).
     */
    async findByAppAndLocation(
        app: string,
        location: string
    ): Promise<ContentNavigation | null> {
        const { data, error } = await this.supabase
            .from('content_navigation')
            .select('*')
            .eq('app', app)
            .eq('location', location)
            .maybeSingle();

        if (error) throw new Error(`Failed to get navigation: ${error.message}`);

        return data;
    }

    /**
     * Get navigation config by ID (PUBLIC).
     */
    async findById(id: string): Promise<ContentNavigation | null> {
        const { data, error } = await this.supabase
            .from('content_navigation')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw new Error(`Failed to get navigation: ${error.message}`);

        return data;
    }

    /**
     * Upsert navigation config for app + location (ADMIN).
     */
    async upsert(
        app: string,
        location: string,
        config: HeaderNavConfig | FooterNavConfig,
        clerkUserId: string
    ): Promise<ContentNavigation> {
        await this.requirePlatformAdmin(clerkUserId);

        const { data, error } = await this.supabase
            .from('content_navigation')
            .upsert(
                { app, location, config },
                { onConflict: 'app,location' }
            )
            .select()
            .single();

        if (error) throw new Error(`Failed to upsert navigation: ${error.message}`);

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
