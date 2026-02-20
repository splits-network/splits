/**
 * V2 Route Registration
 *
 * Instantiates all repositories and services, then registers route handlers.
 */

import { FastifyInstance } from 'fastify';
import { EventPublisher } from './shared/events';
import { PageRepository } from './pages/repository';
import { PageServiceV2 } from './pages/service';
import { registerPageRoutes } from './pages/routes';
import { NavigationRepository } from './navigation/repository';
import { registerNavigationRoutes } from './navigation/routes';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: EventPublisher;
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
}
