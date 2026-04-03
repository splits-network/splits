/**
 * V2 Route Registration
 *
 * Instantiates all repositories and services, then registers route handlers.
 */

import { FastifyInstance } from 'fastify';
import { IEventPublisher } from './shared/events.js';
import { PageRepository } from './pages/repository.js';
import { PageServiceV2 } from './pages/service.js';
import { registerPageRoutes } from './pages/routes.js';
import { NavigationRepository } from './navigation/repository.js';
import { registerNavigationRoutes } from './navigation/routes.js';
import { ImageRepository } from './images/repository.js';
import { ContentImageStorage } from './images/storage.js';
import { ImageServiceV2 } from './images/service.js';
import { registerImageRoutes } from './images/routes.js';
import { registerAdminContentRoutes } from './admin/routes.js';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: IEventPublisher;
}

export function registerV2Routes(app: FastifyInstance, config: RegisterConfig) {
    const pageRepository = new PageRepository(config.supabaseUrl, config.supabaseKey);

    const pageService = new PageServiceV2(
        pageRepository,
        config.eventPublisher
    );

    registerPageRoutes(app, { pageService });

    const navigationRepository = new NavigationRepository(pageRepository.getSupabase());
    registerNavigationRoutes(app, { navigationRepository });

    // Content Images
    const supabase = pageRepository.getSupabase();
    const imageRepository = new ImageRepository(supabase);
    const imageStorage = new ContentImageStorage(supabase);
    const imageService = new ImageServiceV2(
        imageRepository,
        imageStorage,
        config.eventPublisher,
    );

    registerImageRoutes(app, { imageService });

    // Admin routes (permissive — admin-gateway enforces isPlatformAdmin)
    registerAdminContentRoutes(app, {
        supabase,
        pageService,
        navigationRepository,
        imageService,
    });
}
