/**
 * Admin Content Routes — Orchestrator
 *
 * Registers all admin-gateway-facing routes for pages, navigation, and images.
 * Auth is enforced by admin-gateway (isPlatformAdmin) — not by these routes.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { PageServiceV2 } from '../pages/service';
import { NavigationRepository } from '../navigation/repository';
import { ImageServiceV2 } from '../images/service';
import { registerAdminPageRoutes } from './page-routes';
import { registerAdminNavigationRoutes } from './navigation-routes';
import { registerAdminImageRoutes } from './image-routes';

export interface AdminContentRoutesConfig {
    supabase: SupabaseClient;
    pageService: PageServiceV2;
    navigationRepository: NavigationRepository;
    imageService: ImageServiceV2;
}

export function registerAdminContentRoutes(
    app: FastifyInstance,
    config: AdminContentRoutesConfig,
) {
    registerAdminPageRoutes(app, {
        supabase: config.supabase,
        pageService: config.pageService,
    });

    registerAdminNavigationRoutes(app, {
        navigationRepository: config.navigationRepository,
    });

    registerAdminImageRoutes(app, {
        imageService: config.imageService,
    });
}
