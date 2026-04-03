import { FastifyInstance } from 'fastify';
import { IEventPublisher } from './shared/events.js';
import { Logger } from '@splits-network/shared-logging';
import { CryptoService } from '@splits-network/shared-config/src/crypto';
import { registerProviderRoutes } from './providers/routes.js';
import { registerConnectionRoutes } from './connections/routes.js';
import { registerCalendarRoutes } from './calendar/routes.js';
import { registerCallCalendarRoutes } from './calendar/call-calendar-routes.js';
import { registerEmailRoutes } from './email/routes.js';
import { registerLinkedInRoutes } from './linkedin/routes.js';
import { registerATSRoutes } from './ats/routes.js';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    rabbitMqUrl: string;
    eventPublisher: IEventPublisher;
    logger: Logger;
    crypto: CryptoService;
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
        crypto: config.crypto,
    });

    await registerCalendarRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        eventPublisher: config.eventPublisher,
        logger: config.logger,
        crypto: config.crypto,
    });

    await registerCallCalendarRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        eventPublisher: config.eventPublisher,
        logger: config.logger,
        crypto: config.crypto,
    });

    await registerEmailRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        eventPublisher: config.eventPublisher,
        logger: config.logger,
        crypto: config.crypto,
    });

    await registerLinkedInRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        eventPublisher: config.eventPublisher,
        logger: config.logger,
        crypto: config.crypto,
    });

    await registerATSRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        eventPublisher: config.eventPublisher,
        logger: config.logger,
        crypto: config.crypto,
    });
}
