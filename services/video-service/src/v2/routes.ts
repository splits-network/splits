import { FastifyInstance } from 'fastify';
import { IEventPublisher } from './shared/events';
import { registerInterviewRoutes } from './interviews/routes';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    rabbitMqUrl: string;
    eventPublisher: IEventPublisher;
    livekitApiKey: string;
    livekitApiSecret: string;
}

export async function registerV2Routes(app: FastifyInstance, config: RegisterConfig) {
    await registerInterviewRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        eventPublisher: config.eventPublisher,
        livekitApiKey: config.livekitApiKey,
        livekitApiSecret: config.livekitApiSecret,
    });
}
