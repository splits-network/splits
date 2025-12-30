import { FastifyInstance } from 'fastify';
import { registerNotificationRoutes } from './notifications/routes';
import { registerTemplateRoutes } from './templates/routes';
import { EventPublisher } from './shared/events';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    eventPublisher?: EventPublisher;
}

export async function registerV2Routes(app: FastifyInstance, config: RegisterConfig) {
    await registerNotificationRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        eventPublisher: config.eventPublisher,
    });

    await registerTemplateRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        eventPublisher: config.eventPublisher,
    });
}
