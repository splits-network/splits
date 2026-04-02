import { FastifyInstance } from 'fastify';
import { registerDocumentRoutes } from './documents/routes.js';
import { StorageClient } from '../storage.js';
import { IEventPublisher } from './shared/events.js';

interface RegisterConfig {
    supabaseUrl: string;
    supabaseKey: string;
    storage: StorageClient;
    eventPublisher?: IEventPublisher;
}

export async function registerV2Routes(app: FastifyInstance, config: RegisterConfig) {
    await registerDocumentRoutes(app, {
        supabaseUrl: config.supabaseUrl,
        supabaseKey: config.supabaseKey,
        storage: config.storage,
        eventPublisher: config.eventPublisher,
    });
}
