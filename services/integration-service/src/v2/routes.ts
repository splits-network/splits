import { FastifyInstance } from 'fastify';
import { IEventPublisher } from './shared/events';
import { Logger } from '@splits-network/shared-logging';
import { CryptoService } from '@splits-network/shared-config/src/crypto';
import { registerProviderRoutes } from './providers/routes';
import { registerConnectionRoutes } from './connections/routes';
import { registerCalendarRoutes } from './calendar/routes';
import { registerCallCalendarRoutes } from './calendar/call-calendar-routes';
import { registerEmailRoutes } from './email/routes';
import { registerLinkedInRoutes } from './linkedin/routes';
import { registerATSRoutes } from './ats/routes';

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
