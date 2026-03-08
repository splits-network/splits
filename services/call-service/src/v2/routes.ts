import { FastifyInstance } from 'fastify';
import { IEventPublisher } from './shared/events';

export interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    rabbitMqUrl: string;
    eventPublisher: IEventPublisher;
    livekitApiKey: string;
    livekitApiSecret: string;
    livekitWsUrl: string;
}

export async function registerV2Routes(_app: FastifyInstance, _config: RegisterConfig) {
    // Route registration will be added in Plan 42-03
}
