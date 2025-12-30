import { FastifyInstance } from 'fastify';
import { registerDocumentRoutes } from './documents/routes';
import { StorageClient } from '../storage';
import { EventPublisher } from './shared/events';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    storage: StorageClient;
    eventPublisher?: EventPublisher;
}

export async function registerV2Routes(app: FastifyInstance, config: RegisterConfig) {
    await registerDocumentRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        storage: config.storage,
        eventPublisher: config.eventPublisher,
    });
}
