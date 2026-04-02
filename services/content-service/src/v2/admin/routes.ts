/**
 * Admin Content Routes — Orchestrator
 *
 * Registers all admin-gateway-facing routes for pages, navigation, and images.
 * Auth is enforced by admin-gateway (isPlatformAdmin) — not by these routes.
 */

import { FastifyInstance } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { PageServiceV2 } from '../pages/service.js';
import { NavigationRepository } from '../navigation/repository.js';
import { ImageServiceV2 } from '../images/service.js';
import { registerAdminPageRoutes } from './page-routes.js';
import { registerAdminNavigationRoutes } from './navigation-routes.js';
import { registerAdminImageRoutes } from './image-routes.js';

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
