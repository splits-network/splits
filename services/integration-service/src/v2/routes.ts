import { FastifyInstance } from 'fastify';
import { IEventPublisher } from './shared/events';
import { Logger } from '@splits-network/shared-logging';
import { registerProviderRoutes } from './providers/routes';
import { registerConnectionRoutes } from './connections/routes';
import { registerCalendarRoutes } from './calendar/routes';
import { registerEmailRoutes } from './email/routes';
import { registerLinkedInRoutes } from './linkedin/routes';
import { registerATSRoutes } from './ats/routes';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    rabbitMqUrl: string;
    eventPublisher: IEventPublisher;
    logger: Logger;
}

export async function registerV2Routes(app: FastifyInstance, config: RegisterConfig) {
    await registerProviderRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
    });

    await registerConnectionRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        eventPublisher: config.eventPublisher,
        logger: config.logger,
    });

    await registerCalendarRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        eventPublisher: config.eventPublisher,
        logger: config.logger,
    });

    await registerEmailRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        eventPublisher: config.eventPublisher,
        logger: config.logger,
    });

    await registerLinkedInRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        eventPublisher: config.eventPublisher,
        logger: config.logger,
    });

    await registerATSRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        eventPublisher: config.eventPublisher,
        logger: config.logger,
    });
}
