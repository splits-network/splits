import { FastifyInstance } from 'fastify';
import { registerChatRoutes } from './chat/routes';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    rabbitMqUrl: string;
    redisConfig: { host: string; port: number; password?: string };
    eventPublisher: import('./shared/events').EventPublisher;
}

export async function registerV2Routes(app: FastifyInstance, config: RegisterConfig) {
    await registerChatRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        rabbitMqUrl: config.rabbitMqUrl,
        redisConfig: config.redisConfig,
        eventPublisher: config.eventPublisher,
    });
}
